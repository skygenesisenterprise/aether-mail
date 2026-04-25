package utils

import (
	"bufio"
	"crypto/md5"
	"crypto/rand"
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"mime/quotedprintable"
	"net/mail"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

func ParseEmail(rawEmail string) (*models.Email, error) {
	msg, err := mail.ReadMessage(strings.NewReader(rawEmail))
	if err != nil {
		return nil, fmt.Errorf("failed to parse email: %w", err)
	}

	email := &models.Email{
		Headers: make(map[string]string),
	}

	headers := msg.Header
	for key := range headers {
		email.Headers[key] = headers.Get(key)
	}

	email.Subject = decodeHeader(headers.Get("Subject"))

	from, err := mail.ParseAddress(headers.Get("From"))
	if err == nil {
		email.From = &models.EmailAddress{
			Name:  from.Name,
			Email: from.Address,
		}
	}

	to, err := mail.ParseAddressList(headers.Get("To"))
	if err == nil {
		for _, addr := range to {
			email.To = append(email.To, &models.EmailAddress{
				Name:  addr.Name,
				Email: addr.Address,
			})
		}
	}

	cc, err := mail.ParseAddressList(headers.Get("Cc"))
	if err == nil {
		for _, addr := range cc {
			email.Cc = append(email.Cc, &models.EmailAddress{
				Name:  addr.Name,
				Email: addr.Address,
			})
		}
	}

	dateStr := headers.Get("Date")
	email.Date, _ = parseDate(dateStr)

	email.HasAttachments = strings.Contains(strings.ToLower(headers.Get("Content-Type")), "multipart")

	contentType := headers.Get("Content-Type")
	mediaType, boundaryParams, err := mime.ParseMediaType(contentType)
	if err != nil {
		mediaType = "text/plain"
	}

	if strings.HasPrefix(mediaType, "text/") {
		body, _ := readBody(msg.Body)
		if mediaType == "text/html" {
			email.BodyHTML = body
		} else {
			email.Body = body
		}
	} else if mediaType == "multipart/alternative" || mediaType == "multipart/mixed" {
		mr := multipart.NewReader(msg.Body, boundaryParams["boundary"])
		email.Body, email.BodyHTML, email.Attachments = parseMultipart(mr)
	}

	email.Preview = generatePreview(email.Body, email.BodyHTML)

	return email, nil
}

func ParseEmailAddresses(header string) []*models.EmailAddress {
	var addresses []*models.EmailAddress

	list, err := mail.ParseAddressList(header)
	if err != nil {
		return addresses
	}

	for _, addr := range list {
		addresses = append(addresses, &models.EmailAddress{
			Name:  addr.Name,
			Email: addr.Address,
		})
	}

	return addresses
}

func readBody(r io.Reader) (string, error) {
	var body strings.Builder
	scanner := bufio.NewScanner(r)

	buf := make([]byte, 0, 64*1024)
	scanner.Buffer(buf, 1024*1024)

	for scanner.Scan() {
		body.WriteString(scanner.Text())
		body.WriteString("\n")
	}

	if err := scanner.Err(); err != nil {
		return "", err
	}

	content := body.String()

	ct := ""
	if idx := strings.Index(content, "\n"); idx > 0 && strings.HasPrefix(content[:idx], "Content-Transfer-Encoding:") {
		ct = strings.TrimSpace(content[len("Content-Transfer-Encoding:"):idx])
		content = content[idx+1:]
	}

	content = strings.TrimLeft(content, "\n")

	return decodeContent(content, ct), nil
}

func decodePartContent(part *multipart.Part) string {
	content, _ := io.ReadAll(part)
	contentStr := string(content)

	ct := part.Header.Get("Content-Transfer-Encoding")
	charset := extractCharset(part.Header.Get("Content-Type"))

	decoded := decodeContent(contentStr, ct)

	if charset != "" && strings.ToLower(charset) != "utf-8" && !utf8.ValidString(decoded) {
		decoded = ToUTF8(decoded, charset)
	}

	return decoded
}

func decodeContent(content, encoding string) string {
	switch strings.ToLower(encoding) {
	case "quoted-printable":
		reader := quotedprintable.NewReader(strings.NewReader(content))
		result, err := io.ReadAll(reader)
		if err != nil {
			return content
		}
		return string(result)
	case "base64":
		reader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(content))
		result, err := io.ReadAll(reader)
		if err != nil {
			return content
		}
		return string(result)
	}
	return content
}

func extractCharset(contentType string) string {
	if contentType == "" {
		return ""
	}
	_, params, err := mime.ParseMediaType(contentType)
	if err != nil {
		return ""
	}
	return params["charset"]
}

func parseMultipart(mr *multipart.Reader) (string, string, []*models.Attachment) {
	var body, bodyHTML string
	var attachments []*models.Attachment

	for part, err := mr.NextPart(); err == nil; part, err = mr.NextPart() {
		if err != nil {
			break
		}

		partType := part.Header.Get("Content-Type")
		mediaType, _, _ := mime.ParseMediaType(partType)

		disposition := part.Header.Get("Content-Disposition")
		isAttachment := strings.Contains(strings.ToLower(disposition), "attachment")
		isInline := strings.Contains(strings.ToLower(disposition), "inline")

		if isAttachment || isInline {
			filename := part.FileName()
			if filename == "" {
				filename = "unnamed"
			}

			content, _ := io.ReadAll(part)
			att := &models.Attachment{
				Filename:    filename,
				MimeType:    partType,
				Size:        int64(len(content)),
				Inline:      isInline,
				Disposition: disposition,
			}

			if isInline {
				att.CID = part.Header.Get("Content-ID")
			}

			attachments = append(attachments, att)
		} else if strings.HasPrefix(mediaType, "text/") {
			content := decodePartContent(part)
			if mediaType == "text/html" {
				bodyHTML += content
			} else {
				body += content
			}
		}
	}

	return body, bodyHTML, attachments
}

func decodeHeader(header string) string {
	if !strings.Contains(header, "=?") {
		return header
	}

	dec := new(mime.WordDecoder)
	dec.CharsetReader = func(charset string, input io.Reader) (io.Reader, error) {
		return input, nil
	}

	decoded, err := dec.DecodeHeader(header)
	if err != nil {
		return header
	}

	return decoded
}

func parseDate(dateStr string) (time.Time, error) {
	formats := []string{
		time.RFC1123Z,
		time.RFC1123,
		time.RFC822Z,
		time.RFC822,
		time.RFC850,
		time.ANSIC,
		"Mon, 2 Jan 2006 15:04:05 -0700",
		"Mon, 2 Jan 2006 15:04:05 MST",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Now(), fmt.Errorf("unable to parse date: %s", dateStr)
}

func generatePreview(body, bodyHTML string) string {
	preview := body
	if preview == "" {
		preview = stripHTMLTags(bodyHTML)
	}

	preview = strings.TrimSpace(preview)
	if len(preview) > 150 {
		preview = preview[:147] + "..."
	}

	return preview
}

func stripHTMLTags(html string) string {
	re := regexp.MustCompile(`<[^>]*>`)
	text := re.ReplaceAllString(html, " ")
	text = strings.ReplaceAll(text, "&nbsp;", " ")
	text = strings.ReplaceAll(text, "&amp;", "&")
	text = strings.ReplaceAll(text, "&lt;", "<")
	text = strings.ReplaceAll(text, "&gt;", ">")
	text = strings.ReplaceAll(text, "&quot;", "\"")
	text = strings.ReplaceAll(text, "&#39;", "'")
	return strings.TrimSpace(text)
}

func GenerateMessageID() string {
	randBytes := make([]byte, 16)
	rand.Read(randBytes)
	return fmt.Sprintf("<%s.%s@%s>",
		strconv.FormatInt(time.Now().UnixNano(), 36),
		base64.RawURLEncoding.EncodeToString(randBytes),
		"aether-mail")
}

func GenerateMessageHash(from, to, subject, date string) string {
	data := fmt.Sprintf("%s:%s:%s:%s", from, to, subject, date)
	hash := md5.Sum([]byte(data))
	return fmt.Sprintf("%x", hash)
}

func GenerateUID(email string, uid int) string {
	return fmt.Sprintf("%s/%d", email, uid)
}

func CalculateEmailHash(content []byte) string {
	hash := sha1.Sum(content)
	return fmt.Sprintf("%x", hash)
}

func ValidateEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

func ExtractDomain(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) < 2 {
		return ""
	}
	return parts[1]
}

func BuildEmail(from, to, subject, body string) []byte {
	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/plain; charset=\"UTF-8\""
	headers["Date"] = time.Now().Format(time.RFC1123Z)

	var msg strings.Builder
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")
	msg.WriteString(body)

	return []byte(msg.String())
}

func BuildEmailHTML(from, to, subject, bodyHTML string) []byte {
	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=\"UTF-8\""
	headers["Date"] = time.Now().Format(time.RFC1123Z)

	var msg strings.Builder
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")
	msg.WriteString(bodyHTML)

	return []byte(msg.String())
}

func BuildMultipartEmail(from, to, subject, body, bodyHTML string, attachments []*models.SendAttachment) []byte {
	boundary := generateBoundary()

	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = fmt.Sprintf("multipart/mixed; boundary=\"%s\"", boundary)

	var msg strings.Builder
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")

	msg.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	msg.WriteString("Content-Type: multipart/alternative; boundary=\"inner-boundary\"\r\n")
	msg.WriteString("\r\n")

	msg.WriteString(fmt.Sprintf("--inner-boundary\r\n"))
	msg.WriteString("Content-Type: text/plain; charset=\"UTF-8\"\r\n")
	msg.WriteString("Content-Transfer-Encoding: quoted-printable\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(body)
	msg.WriteString("\r\n\r\n")

	msg.WriteString(fmt.Sprintf("--inner-boundary\r\n"))
	msg.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
	msg.WriteString("Content-Transfer-Encoding: quoted-printable\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(bodyHTML)
	msg.WriteString("\r\n\r\n")

	msg.WriteString("--inner-boundary--\r\n")

	for _, att := range attachments {
		msg.WriteString(fmt.Sprintf("\r\n--%s\r\n", boundary))
		msg.WriteString(fmt.Sprintf("Content-Type: %s; name=\"%s\"\r\n", att.MimeType, att.Filename))
		msg.WriteString("Content-Transfer-Encoding: base64\r\n")
		msg.WriteString(fmt.Sprintf("Content-Disposition: attachment; filename=\"%s\"\r\n", att.Filename))
		msg.WriteString("\r\n")

		encoded := base64.StdEncoding.EncodeToString([]byte(att.Content))
		for i := 0; i < len(encoded); i += 76 {
			end := i + 76
			if end > len(encoded) {
				end = len(encoded)
			}
			msg.WriteString(encoded[i:end])
			msg.WriteString("\r\n")
		}
	}

	msg.WriteString(fmt.Sprintf("\r\n--%s--\r\n", boundary))

	return []byte(msg.String())
}

func generateBoundary() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return base64.RawURLEncoding.EncodeToString(bytes)
}

func QuotedPrintableEncode(s string) string {
	var buf strings.Builder
	for _, r := range s {
		if r > 127 || r == '=' || r == '\n' || r == '\r' {
			fmt.Fprintf(&buf, "=%02X", r)
		} else {
			buf.WriteRune(r)
		}
	}
	return buf.String()
}

func QuotedPrintableDecode(s string) (string, error) {
	var buf strings.Builder
	r := strings.NewReader(s)
	for {
		c, size, err := r.ReadRune()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", err
		}

		if c == '=' && size == 1 {
			var hex [2]byte
			n, _ := r.Read(hex[:2])
			if n != 2 {
				buf.WriteRune(c)
				continue
			}
			b, err := strconv.ParseInt(string(hex[:2]), 16, 64)
			if err != nil {
				buf.WriteRune(c)
				continue
			}
			buf.WriteByte(byte(b))
		} else {
			buf.WriteRune(c)
		}
	}
	return buf.String(), nil
}

func IsUTF8(s string) bool {
	return utf8.ValidString(s)
}

func ToUTF8(s, charset string) string {
	if IsUTF8(s) {
		return s
	}
	return s
}

func SanitizeFilename(filename string) string {
	filename = strings.ReplaceAll(filename, "/", "_")
	filename = strings.ReplaceAll(filename, "\\", "_")
	filename = strings.ReplaceAll(filename, "..", "_")
	filename = strings.ReplaceAll(filename, "\x00", "")
	return strings.TrimSpace(filename)
}

func GetFileExtension(filename string) string {
	parts := strings.Split(filename, ".")
	if len(parts) < 2 {
		return ""
	}
	return "." + parts[len(parts)-1]
}

func GetMimeType(filename string) string {
	ext := GetFileExtension(filename)
	ext = strings.ToLower(ext)

	mimeTypes := map[string]string{
		".html": "text/html",
		".htm":  "text/html",
		".txt":  "text/plain",
		".css":  "text/css",
		".js":   "application/javascript",
		".json": "application/json",
		".xml":  "application/xml",
		".pdf":  "application/pdf",
		".zip":  "application/zip",
		".gz":   "application/gzip",
		".tar":  "application/x-tar",
		".rar":  "application/vnd.rar",
		".7z":   "application/x-7z-compressed",
		".doc":  "application/msword",
		".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".xls":  "application/vnd.ms-excel",
		".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		".ppt":  "application/vnd.ms-powerpoint",
		".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".bmp":  "image/bmp",
		".svg":  "image/svg+xml",
		".ico":  "image/x-icon",
		".mp3":  "audio/mpeg",
		".wav":  "audio/wav",
		".mp4":  "video/mp4",
		".avi":  "video/x-msvideo",
		".mov":  "video/quicktime",
	}

	if mime, ok := mimeTypes[ext]; ok {
		return mime
	}
	return "application/octet-stream"
}
