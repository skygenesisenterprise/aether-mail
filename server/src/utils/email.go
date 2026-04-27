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
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"golang.org/x/text/encoding/charmap"
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
		body, _ := io.ReadAll(msg.Body)
		bodyStr := string(body)
		encoding := headers.Get("Content-Transfer-Encoding")
		charset := extractCharset(headers.Get("Content-Type"))
		bodyStr = decodeContent(bodyStr, encoding)
		if charset != "" && strings.ToLower(charset) != "utf-8" && !utf8.ValidString(bodyStr) {
			bodyStr = ToUTF8(bodyStr, charset)
		}
		if mediaType == "text/html" {
			email.BodyHTML = CleanMimeContent(bodyStr)
		} else {
			email.Body = bodyStr
		}
	} else if strings.HasPrefix(mediaType, "multipart/") {
		boundary := boundaryParams["boundary"]
		if boundary != "" {
			// Decode Content-Transfer-Encoding before parsing multipart
			// because boundaries must be in raw form for multipart.NewReader
			encoding := strings.ToLower(headers.Get("Content-Transfer-Encoding"))
			if encoding == "quoted-printable" || encoding == "base64" {
				rawBody, _ := io.ReadAll(msg.Body)
				decodedBody := decodeContent(string(rawBody), encoding)
				mr := multipart.NewReader(strings.NewReader(decodedBody), boundary)
				email.Body, email.BodyHTML, email.Attachments = parseMultipart(mr)
			} else {
				mr := multipart.NewReader(msg.Body, boundary)
				email.Body, email.BodyHTML, email.Attachments = parseMultipart(mr)
			}
		} else {
			body, _ := io.ReadAll(msg.Body)
			email.Body = string(body)
		}
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

	if charset != "" && strings.ToLower(charset) != "utf-8" {
		if !utf8.ValidString(decoded) {
			decoded = ToUTF8(decoded, charset)
		}
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
		// Base64-encoded email parts are often wrapped at 76 chars with newlines.
		// The standard decoder is strict about newlines, so strip them first.
		cleanContent := strings.ReplaceAll(content, "\r\n", "")
		cleanContent = strings.ReplaceAll(cleanContent, "\n", "")
		cleanContent = strings.ReplaceAll(cleanContent, "\r", "")
		reader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(cleanContent))
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
		mediaType, partParams, _ := mime.ParseMediaType(partType)

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
			if mediaType == "text/html" && bodyHTML == "" {
				bodyHTML = CleanMimeContent(content)
			} else if mediaType == "text/plain" && body == "" {
				body = content
			}
		} else if mediaType == "multipart/alternative" || mediaType == "multipart/mixed" {
			innerBoundary := partParams["boundary"]
			if innerBoundary != "" {
				innerMr := multipart.NewReader(part, innerBoundary)
				innerBody, innerBodyHTML, innerAtts := parseMultipart(innerMr)
				if innerBodyHTML != "" && bodyHTML == "" {
					bodyHTML = innerBodyHTML
				} else if innerBody != "" && body == "" {
					body = innerBody
				}
				attachments = append(attachments, innerAtts...)
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
	reader := quotedprintable.NewReader(strings.NewReader(s))
	result, err := io.ReadAll(reader)
	if err != nil {
		return "", err
	}
	return string(result), nil
}

func IsUTF8(s string) bool {
	return utf8.ValidString(s)
}

func DetectAndFixUTF8(s string) string {
	if s == "" {
		return s
	}

	// If the string is not valid UTF-8, try to decode from common charsets
	if !utf8.ValidString(s) {
		return ToUTF8(s, "windows-1252")
	}

	// Check for double-encoded UTF-8:
	// UTF-8 bytes were interpreted as ISO-8859-1 runes and re-encoded as UTF-8.
	// To reverse: take each rune's low 8 bits as raw bytes, then check if they form valid UTF-8.
	var rawBytes []byte
	hasHighControl := false
	for _, r := range s {
		if r > 0xFF {
			// A rune > 0xFF cannot be a single ISO-8859-1 byte, so not uniformly double-encoded
			return s
		}
		rawBytes = append(rawBytes, byte(r))
		if r >= 0x80 && r <= 0x9F {
			hasHighControl = true
		}
	}

	// Only attempt fix if there are suspicious control-range characters
	// or well-known double-encoding indicators
	if !hasHighControl && !strings.Contains(s, "â") && !strings.Contains(s, "Ã") && !strings.Contains(s, "ï¿½") {
		return s
	}

	if utf8.Valid(rawBytes) {
		decoded := string(rawBytes)
		if decoded != s {
			// Validate: decoded should have fewer control chars in the 0x80-0x9F range
			if countControlChars(decoded) < countControlChars(s) {
				return decoded
			}
			// Also accept if decoded has no replacement chars while original might
			if strings.Contains(s, "ï¿½") && !strings.Contains(decoded, "ï¿½") {
				return decoded
			}
		}
	}

	return s
}

func countControlChars(s string) int {
	count := 0
	for _, r := range s {
		if r >= 0x80 && r <= 0x9F {
			count++
		}
	}
	return count
}

func ToUTF8(s, charset string) string {
	if IsUTF8(s) {
		return s
	}

	charset = strings.ToLower(strings.TrimSpace(charset))
	if charset == "" || charset == "utf-8" || charset == "utf8" {
		return s
	}

	if charset == "windows-1252" || charset == "cp1252" {
		decoder := charmap.Windows1252.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "latin1" || charset == "iso-8859-1" || charset == "latin-1" {
		decoder := charmap.ISO8859_1.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "iso-8859-15" || charset == "latin9" {
		decoder := charmap.ISO8859_15.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "iso-8859-2" || charset == "latin2" {
		decoder := charmap.ISO8859_2.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "iso-8859-5" || charset == "cyrillic" {
		decoder := charmap.ISO8859_5.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "iso-8859-7" || charset == "greek" {
		decoder := charmap.ISO8859_7.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "iso-8859-8" || charset == "hebrew" {
		decoder := charmap.ISO8859_8.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "windows-1250" {
		decoder := charmap.Windows1250.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "windows-1251" {
		decoder := charmap.Windows1251.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "windows-1253" {
		decoder := charmap.Windows1253.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "windows-1254" {
		decoder := charmap.Windows1254.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "windows-1255" {
		decoder := charmap.Windows1255.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "windows-1256" {
		decoder := charmap.Windows1256.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "windows-1257" {
		decoder := charmap.Windows1257.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}
	if charset == "koi8-r" || charset == "koi8u" || charset == "koi-8-r" {
		decoder := charmap.KOI8R.NewDecoder()
		decoded, err := decoder.String(s)
		if err == nil {
			return decoded
		}
	}

	runes := []rune{}
	for _, b := range []byte(s) {
		runes = append(runes, rune(b))
	}
	return string(runes)
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
		".webp": "image/webp",
		".avif": "image/avif",
		".heic": "image/heic",
		".heif": "image/heif",
		".tiff": "image/tiff",
		".tif":  "image/tiff",
		".raw":  "image/raw",
		".cr2":  "image/x-canon-cr2",
		".nef":  "image/x-nikon-nef",
		".arw":  "image/x-sony-arw",
		".dng":  "image/x-adobe-dng",
		".psd":  "image/vnd.adobe.photoshop",
		".ai":   "image/illustrator",
		".eps":  "image/eps",
		".wbmp": "image/vnd.wap.wbmp",
		".xbm":  "image/x-xbitmap",
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

func splitMimeBody(body string) string {
	if body == "" {
		return body
	}

	lower := strings.ToLower(body)
	if !strings.Contains(lower, "----_nmp") && !strings.Contains(lower, "--==_") {
		return body
	}

	lines := strings.Split(body, "\n")
	var boundaries []string

	boundaryRe := regexp.MustCompile(`--(----_NmP-[^-\s]+|==_[A-Za-z0-9_-]+)`)
	for _, line := range lines {
		matches := boundaryRe.FindStringSubmatch(line)
		if len(matches) > 1 && !containsStr(boundaries, matches[1]) {
			boundaries = append(boundaries, matches[1])
		}
	}

	if len(boundaries) == 0 {
		return body
	}

	for _, boundary := range boundaries {
		parts := strings.Split(body, "--"+boundary)
		for _, part := range parts {
			partLower := strings.ToLower(part)
			if strings.Contains(partLower, "text/html") && !strings.Contains(partLower, "content-id:") {
				content := extractMimePartContent(part)
				if content != "" && !strings.Contains(strings.ToLower(content), "boundary=") {
					return content
				}
			}
		}
	}

	for _, boundary := range boundaries {
		parts := strings.Split(body, "--"+boundary)
		for _, part := range parts {
			content := extractMimePartContent(part)
			if content != "" && len(content) > 20 {
				return content
			}
		}
	}

	return body
}

func extractMimePartContent(part string) string {
	lines := strings.Split(part, "\n")
	inContent := false
	var contentLines []string

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			if !inContent {
				inContent = true
				continue
			}
		}
		if inContent {
			contentLines = append(contentLines, line)
		}
	}

	if len(contentLines) == 0 {
		return part
	}

	content := strings.Join(contentLines, "\n")
	content = strings.TrimSpace(content)

	lower := strings.ToLower(part)
	if strings.Contains(lower, "quoted-printable") {
		content = decodeContent(content, "quoted-printable")
	} else if strings.Contains(lower, "base64") {
		content = decodeContent(content, "base64")
	}

	charset := extractCharset(part)
	if charset != "" && strings.ToLower(charset) != "utf-8" && !IsUTF8(content) {
		content = ToUTF8(content, charset)
	}

	return content
}

func containsStr(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func CleanMimeContent(content string) string {
	if content == "" {
		return content
	}

	cleaned := content

	cleaned = removeMimeHeaders(cleaned)

	cleaned = removeCssBlocks(cleaned)

	cleaned = removeStyleTags(cleaned)

	cleaned = removeOutlookTags(cleaned)

	cleaned = removeHtmlComments(cleaned)

	// NOTE: We intentionally keep inline styles (style="...") because HTML
	// emails rely on them for layout. They are safe from an XSS perspective
	// and essential for correct rendering across email clients.

	// NOTE: We intentionally keep empty tags (<div></div>, <span></span>, etc.)
	// because they are commonly used for spacing and structural layout in emails.

	cleaned = strings.TrimSpace(cleaned)

	return cleaned
}

func removeMimeHeaders(content string) string {
	lines := strings.Split(content, "\n")
	var result []string
	inHeaders := true

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)

		if inHeaders {
			if trimmed == "" {
				inHeaders = false
				if len(result) > 0 {
					continue
				}
			}
			if strings.HasPrefix(trimmed, "Content-") ||
			   strings.HasPrefix(trimmed, "MIME-") ||
			   strings.HasPrefix(trimmed, "----") ||
			   regexp.MustCompile(`^--[A-Za-z0-9_-]+$`).MatchString(trimmed) {
				continue
			}
			if regexp.MustCompile(`^_Part_[0-9.]+$`).MatchString(trimmed) {
				continue
			}
			if regexp.MustCompile(`^#__bodyTable__`).MatchString(trimmed) {
				continue
			}
		}

		result = append(result, line)
	}

	return strings.Join(result, "\n")
}

func removeCssBlocks(content string) string {
	result := content

	result = regexp.MustCompile(`(?i)<style[^>]*>[\s\S]*?</style>`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)<style[^>]*>`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)</style>`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`(?i)\.mcn[a-zA-Z0-9_\-]*[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.mce[a-zA-Z0-9_\-]*[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.body[a-zA-Z0-9_\-]*[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.ExternalClass[a-zA-Z0-9_\-]*[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.ReadMsgBody[a-zA-Z0-9_\-]*[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.ProseMirror[a-zA-Z0-9_\-]*[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.mcnTextContent[a-zA-Z0-9_\-]*[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.section[a-zA-Z0-9_\-]*[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.footer[a-zA-Z0-9_\-]*[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.header[a-zA-Z0-9_\-]*[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.mceSpacing-\d+[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.mcnPreviewText[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\.mcnImageBorder[,>]?[^{]*\{[^}]*\}`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`(?i)body\s*,?\s*#?body[a-zA-Z0-9_\-]*\s*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)p\s*,?\s*a\s*,?\s*li\s*,?\s*td\s*,?\s*blockquote\s*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)table\s*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)td\s*,?\s*p\s*,?\s*a\s*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)img\s*,?\s*a\s*img\s*\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)h[1-6]\s*\{[^}]*\}`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`(?i)@media[^{]*\{[\s\S]*?\}`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`(?i)a\[href\^="tel"\][\s\S]*?\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)a\[href\^="sms"\][\s\S]*?\{[^}]*\}`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)a\[href\^="mailto:"\][\s\S]*?\{[^}]*\}`).ReplaceAllString(result, "")

	// NOTE: Removed overly broad regex `\{\s*[\w\-]+:\s*[^;]+;?\s*\}`
	// which could accidentally match content inside <pre>, <code>, or JSON-LD
	// blocks outside of <style> tags. CSS inside <style> is already handled
	// by removeStyleTags().

	result = regexp.MustCompile(`^[\s]*--[A-Za-z0-9_-]+[\s]*$`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`^[\s]*----[\s]*$`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`^[\s]*}[\s]*$`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`^[\s]*{[\s]*}$`).ReplaceAllString(result, "")

	lines := strings.Split(result, "\n")
	var cleanedLines []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		lowerTrimmed := strings.ToLower(trimmed)
		if regexp.MustCompile(`^[\w\s,]+\{$`).MatchString(trimmed) {
			continue
		}
		if regexp.MustCompile(`^[\.>#][\w\s,\[\]\-:]+{$`).MatchString(trimmed) {
			continue
		}
		if strings.HasPrefix(lowerTrimmed, "@media") {
			continue
		}
		if strings.HasPrefix(lowerTrimmed, "body,") || strings.HasPrefix(lowerTrimmed, "body{") {
			continue
		}
		if strings.HasPrefix(lowerTrimmed, ".mce") || strings.HasPrefix(lowerTrimmed, ".mce{") {
			continue
		}
		if strings.HasPrefix(lowerTrimmed, ".mcn") || strings.HasPrefix(lowerTrimmed, ".mcn{") {
			continue
		}
		if strings.HasPrefix(lowerTrimmed, ".prosemirror") || strings.HasPrefix(lowerTrimmed, ".prosemirror{") {
			continue
		}
		if strings.HasPrefix(lowerTrimmed, ".section") || strings.HasPrefix(lowerTrimmed, ".section{") {
			continue
		}
		if strings.HasPrefix(lowerTrimmed, "#body") || strings.HasPrefix(lowerTrimmed, "#body{") {
			continue
		}
		if trimmed == "}" || trimmed == "{" {
			continue
		}
		cleanedLines = append(cleanedLines, line)
	}

	return strings.Join(cleanedLines, "\n")
}

func removeStyleTags(content string) string {
	result := content

	result = regexp.MustCompile(`(?i)<style[^>]*>[\s\S]*?</style>`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)<style[^>]*>`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)</style>`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`(?i)<link[^>]*rel=["']?stylesheet["']?[^>]*>`).ReplaceAllString(result, "")
	// NOTE: We only remove stylesheet links, not all <link> tags, to avoid
	// accidentally removing useful resources like preconnect hints or icons.

	return result
}

func removeOutlookTags(content string) string {
	result := content

	result = regexp.MustCompile(`(?i)<o:p[^>]*>[\s\S]*?</o:p>`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`(?i)<!--\s*if\s+(mso|gte|lt)[^>]*>[\s\S]*?<!--\s*endif\s*-->`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)<!--\[if\s+!?mso[\s\S]*?<!\[endif\]-->`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`(?i)\bmso-[^:;]+:[^;]+;?`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\btab-interval:[^;]+;?`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\bmso-table-lspace:[^;]+;?`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\bmso-table-rspace:[^;]+;?`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`(?i)class="[^"]*mcn[^\s]*[^"]*"`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)class="[^"]*Mso[^\s]*[^"]*"`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`(?i)data-[a-z-]+="[^"]*"`).ReplaceAllString(result, "")

	return result
}

func removeHtmlComments(content string) string {
	result := content
	result = regexp.MustCompile(`(?i)<!--[\s\S]*?-->`).ReplaceAllString(result, "")
	return result
}

func removeInlineStyles(content string) string {
	result := content

	result = regexp.MustCompile(`(?i)\s*style="[^"]*"`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)\s*style='[^']*'`).ReplaceAllString(result, "")

	return result
}

func removeEmptyTags(content string) string {
	result := content

	result = regexp.MustCompile(`(?i)<html[^>]*>`).ReplaceAllString(result, "<html>")
	result = regexp.MustCompile(`(?i)</html>.*`).ReplaceAllString(result, "</html>")

	result = regexp.MustCompile(`(?i)<head>[\s\S]*?</head>`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)<body[^>]*>`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)</body>.*`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`(?i)<div>\s*</div>`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)<span>\s*</span>`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)<p>\s*</p>`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`(?i)<p>\s*<br\s*/>\s*</p>`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`^\s*$`).ReplaceAllString(result, "")

	return result
}

func DetectAndFixDoubleEncoding(s string) string {
	if s == "" {
		return s
	}

	replacements := []struct {
		pattern  string
		replacement string
	}{
		{"Ã©", "é"}, {"Ã¨", "è"}, {"Ã ", "à"}, {"Ã¢", "â"},
		{"Ã®", "i"}, {"Ã´", "ô"}, {"Ã»", "û"}, {"Ã§", "c"},
		{"Ã«", "ë"}, {"Ã¯", "ï"}, {"Ã¼", "ü"}, {"Ã¶", "ö"},
		{"Ã¤", "ä"}, {"Ã£", "ã"}, {"Ã±", "ñ"}, {"Ã³", "ó"},
		{"Ãº", "ú"}, {"Ã­", "í"}, {"Ã¡", "á"},
		{"Ã‰", "É"}, {"Ãˆ", "È"}, {"Ã€", "À"}, {"ÃŽ", "Î"},
		{"Ã" + "Ô", "Ô"}, {"Ã‡", "Ç"},
		{"â€™", "'"}, {"â€œ", "«"}, {"â€", "»"},
		{"â€" + "–", "–"}, {"â€" + "—", "—"},
		{"â€" + "¦", "..."}, {"Â ", " "}, {"Â©", "©"},
		{"Â®", "®"}, {"Â™", "™"}, {"Â¼", "¼"},
		{"Â½", "½"}, {"Â¾", "¾"},
	}

	result := s
	for _, r := range replacements {
		result = strings.ReplaceAll(result, r.pattern, r.replacement)
	}

	return result
}

func DetectEmailClient(rawEmail string) string {
	lower := strings.ToLower(rawEmail)

	if strings.Contains(lower, "x-mailer: microsoft outlook") ||
	   strings.Contains(lower, "x-msmail:") ||
	   strings.Contains(lower, "x-mimeole:") {
		return "Outlook"
	}
	if strings.Contains(lower, "x-mailer: apple mail") ||
	   strings.Contains(lower, "x-mailer: mail") ||
	   strings.Contains(lower, "x-apple-mail") {
		return "Apple Mail"
	}
	if strings.Contains(lower, "x-mailer: gmail") ||
	   strings.Contains(lower, "x-google-mail") {
		return "Gmail"
	}
	if strings.Contains(lower, "x-mailer: thunderbird") ||
	   strings.Contains(lower, "x-mozilla-status") {
		return "Thunderbird"
	}
	if strings.Contains(lower, "x-mailer: office 365") ||
	   strings.Contains(lower, "x-originating-ip") {
		return "Office 365"
	}
	if strings.Contains(lower, "x-mailer: sendgrid") ||
	   strings.Contains(lower, "x-sendgrid") {
		return "SendGrid"
	}
	if strings.Contains(lower, "x-mailer: mailchimp") ||
	   strings.Contains(lower, "x-mailchimp") {
		return "Mailchimp"
	}
	if strings.Contains(lower, "x-mailer: hubspot") ||
	   strings.Contains(lower, "x-hubspot") {
		return "HubSpot"
	}
	if strings.Contains(lower, "x-mailer: postmark") {
		return "Postmark"
	}
	if strings.Contains(lower, "x-mailer: mandrill") {
		return "Mandrill"
	}

	return "Unknown"
}

func NormalizeContentType(contentType string) string {
	if contentType == "" {
		return "text/plain"
	}

	ct := strings.ToLower(strings.TrimSpace(contentType))

	if strings.HasPrefix(ct, "text/html") {
		return "text/html"
	}
	if strings.HasPrefix(ct, "text/plain") {
		return "text/plain"
	}
	if strings.HasPrefix(ct, "text/") {
		return ct
	}
	if strings.HasPrefix(ct, "multipart/") {
		return "multipart/mixed"
	}
	if strings.HasPrefix(ct, "image/") {
		return "image"
	}
	if strings.HasPrefix(ct, "application/") {
		return "application"
	}

	return "text/plain"
}

func ExtractCharsetFromContentType(contentType string) string {
	if contentType == "" {
		return ""
	}

	patterns := []string{
		`charset=["']?([^"';\s]+)["']?`,
		`charset=([^\s;]+)`,
		`;\s*charset=([^\s;]+)`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(contentType)
		if len(matches) > 1 {
			charset := strings.Trim(matches[1], "\"' ")
			if charset != "" {
				return charset
			}
		}
	}

	return ""
}

func IsQuotedPrintableContent(content string) bool {
	return strings.Contains(content, "=3D") ||
		   strings.Contains(content, "=20") ||
		   strings.Contains(content, "=0A") ||
		   strings.Contains(content, "=09") ||
		   regexp.MustCompile(`=[0-9A-Fa-f]{2}`).MatchString(content)
}

func IsBase64Content(content string) bool {
	cleaned := strings.TrimSpace(content)
	if len(cleaned) < 100 {
		return false
	}

	allowedChars := regexp.MustCompile(`^[A-Za-z0-9+/=\s]+$`)
	if !allowedChars.MatchString(cleaned) {
		return false
	}

	lines := strings.Split(cleaned, "\n")
	totalChars := 0
	base64Chars := 0

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if len(trimmed) > 0 {
			totalChars += len(trimmed)
			for _, c := range trimmed {
				if c == 'A' || c == 'B' || c == 'C' || c == 'D' || c == 'E' || c == 'F' ||
				   c == 'G' || c == 'H' || c == 'I' || c == 'J' || c == 'K' || c == 'L' ||
				   c == 'M' || c == 'N' || c == 'O' || c == 'P' || c == 'Q' || c == 'R' ||
				   c == 'S' || c == 'T' || c == 'U' || c == 'V' || c == 'W' || c == 'X' ||
				   c == 'Y' || c == 'Z' || c == 'a' || c == 'b' || c == 'c' || c == 'd' ||
				   c == 'e' || c == 'f' || c == 'g' || c == 'h' || c == 'i' || c == 'j' ||
				   c == 'k' || c == 'l' || c == 'm' || c == 'n' || c == 'o' || c == 'p' ||
				   c == 'q' || c == 'r' || c == 's' || c == 't' || c == 'u' || c == 'v' ||
				   c == 'w' || c == 'x' || c == 'y' || c == 'z' || c == '0' || c == '1' ||
				   c == '2' || c == '3' || c == '4' || c == '5' || c == '6' || c == '7' ||
				   c == '8' || c == '9' || c == '+' || c == '/' || c == '=' {
					base64Chars++
				}
			}
		}
	}

	if totalChars > 0 {
		ratio := float64(base64Chars) / float64(totalChars)
		return ratio > 0.8
	}

	return false
}

func FixQuotedPrintableEqualsSign(content string) string {
	result := content
	result = strings.ReplaceAll(result, "=3D", "=")
	result = strings.ReplaceAll(result, "=3d", "=")
	result = strings.ReplaceAll(result, "=20", " ")
	result = strings.ReplaceAll(result, "=0A", "\n")
	result = strings.ReplaceAll(result, "=0a", "\n")
	result = strings.ReplaceAll(result, "=09", "\t")
	result = regexp.MustCompile(`=\r?\n`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`=([0-9A-Fa-f]{2})`).ReplaceAllStringFunc(result, func(match string) string {
		hex := match[1:]
		if len(hex) == 2 {
			if val, err := strconv.ParseInt(hex, 16, 64); err == nil {
				return string(rune(val))
			}
		}
		return match
	})

	return result
}

func SanitizeFilenameForAttachment(filename string) string {
	if filename == "" {
		return "attachment"
	}

	filename = strings.ReplaceAll(filename, "/", "_")
	filename = strings.ReplaceAll(filename, "\\", "_")
	filename = strings.ReplaceAll(filename, "..", "_")
	filename = strings.ReplaceAll(filename, "\x00", "")
	filename = strings.ReplaceAll(filename, "\n", "_")
	filename = strings.ReplaceAll(filename, "\r", "_")
	filename = strings.ReplaceAll(filename, "\t", "_")

	filename = regexp.MustCompile(`[<>:"|?*]`).ReplaceAllString(filename, "_")

	filename = strings.TrimSpace(filename)
	if filename == "" {
		return "attachment"
	}
	if len(filename) > 200 {
		ext := filepath.Ext(filename)
		name := filename[:len(filename)-len(ext)]
		if len(name) > 190 {
			name = name[:190]
		}
		filename = name + ext
	}

	return filename
}

func GetMimeTypeFromFilename(filename string) string {
	if filename == "" {
		return "application/octet-stream"
	}

	ext := strings.ToLower(filepath.Ext(filename))

	mimeTypes := map[string]string{
		".html": "text/html",
		".htm":  "text/html",
		".txt":  "text/plain",
		".text": "text/plain",
		".css":  "text/css",
		".js":   "application/javascript",
		".json": "application/json",
		".xml":  "application/xml",
		".pdf":  "application/pdf",
		".doc":  "application/msword",
		".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".xls":  "application/vnd.ms-excel",
		".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		".ppt":  "application/vnd.ms-powerpoint",
		".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		".zip":  "application/zip",
		".gz":   "application/gzip",
		".tar":  "application/x-tar",
		".rar":  "application/vnd.rar",
		".7z":   "application/x-7z-compressed",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".bmp":  "image/bmp",
		".svg":  "image/svg+xml",
		".webp": "image/webp",
		".ico":  "image/x-icon",
		".tiff": "image/tiff",
		".tif":  "image/tiff",
		".mp3":  "audio/mpeg",
		".wav":  "audio/wav",
		".mp4":  "video/mp4",
		".avi":  "video/x-msvideo",
		".mov":  "video/quicktime",
		".msg":  "application/vnd.ms-outlook",
		".eml":  "message/rfc822",
		".ics":  "text/calendar",
		".vcf":  "text/vcard",
	}

	if mime, ok := mimeTypes[ext]; ok {
		return mime
	}

	return "application/octet-stream"
}

func ExtractMessageID(headers map[string]string) string {
	if msgID, ok := headers["Message-ID"]; ok {
		return msgID
	}
	if msgID, ok := headers["X-Message-ID"]; ok {
		return msgID
	}
	if msgID, ok := headers["X-Google-Message-ID"]; ok {
		return msgID
	}

	return ""
}

func ExtractInReplyTo(headers map[string]string) string {
	if inReplyTo, ok := headers["In-Reply-To"]; ok {
		return inReplyTo
	}
	if references, ok := headers["References"]; ok {
		parts := strings.Split(references, " ")
		if len(parts) > 0 {
			return parts[len(parts)-1]
		}
	}

	return ""
}

func IsAutoResponse(headers map[string]string) bool {
	lowerHeaders := make(map[string]string)
	for k, v := range headers {
		lowerHeaders[strings.ToLower(k)] = strings.ToLower(v)
	}

	if autoSubmitted, ok := lowerHeaders["auto-submitted"]; ok {
		if strings.Contains(autoSubmitted, "auto-generated") ||
		   strings.Contains(autoSubmitted, "auto-replied") {
			return true
		}
	}

	if _, ok := lowerHeaders["x-auto-response-suppress"]; ok {
		return true
	}

	return false
}

func IsDeliveryNotification(headers map[string]string) bool {
	lowerHeaders := make(map[string]string)
	for k, v := range headers {
		lowerHeaders[strings.ToLower(k)] = strings.ToLower(v)
	}

	if nt, ok := lowerHeaders["content-type"]; ok {
		if strings.Contains(nt, "multipart/report") ||
		   strings.Contains(nt, "message/delivery-status") {
			return true
		}
	}

	if _, ok := lowerHeaders["x-failed-message"]; ok {
		return true
	}

	return false
}

func ExtractPlainTextFromHtml(html string) string {
	if html == "" {
		return ""
	}

	result := html

	result = regexp.MustCompile(`<script[^>]*>[\s\S]*?</script>`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`<style[^>]*>[\s\S]*?</style>`).ReplaceAllString(result, "")
	result = regexp.MustCompile(`<!--[\s\S]*?-->`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`<br\s*/?>`).ReplaceAllString(result, "\n")
	result = regexp.MustCompile(`<br>`).ReplaceAllString(result, "\n")

	result = regexp.MustCompile(`</p>`).ReplaceAllString(result, "\n\n")
	result = regexp.MustCompile(`</div>`).ReplaceAllString(result, "\n")
	result = regexp.MustCompile(`</li>`).ReplaceAllString(result, "\n")
	result = regexp.MustCompile(`</h[1-6]>`).ReplaceAllString(result, "\n\n")

	result = regexp.MustCompile(`<[^>]+>`).ReplaceAllString(result, "")

	result = regexp.MustCompile(`&nbsp;`).ReplaceAllString(result, " ")
	result = regexp.MustCompile(`&amp;`).ReplaceAllString(result, "&")
	result = regexp.MustCompile(`&lt;`).ReplaceAllString(result, "<")
	result = regexp.MustCompile(`&gt;`).ReplaceAllString(result, ">")
	result = regexp.MustCompile(`&quot;`).ReplaceAllString(result, "\"")
	result = regexp.MustCompile(`&#39;`).ReplaceAllString(result, "'")
	result = regexp.MustCompile(`&#\d+;`).ReplaceAllStringFunc(result, func(match string) string {
		re := regexp.MustCompile(`&#(\d+);`)
		matches := re.FindStringSubmatch(match)
		if len(matches) > 1 {
			if val, err := strconv.Atoi(matches[1]); err == nil {
				return string(rune(val))
			}
		}
		return match
	})

	result = regexp.MustCompile(`[\n\r]+`).ReplaceAllString(result, "\n")
	result = regexp.MustCompile(`\n\n+`).ReplaceAllString(result, "\n\n")

	result = strings.TrimSpace(result)

	return result
}

func IsValidEmailAddress(email string) bool {
	if email == "" {
		return false
	}

	pattern := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return pattern.MatchString(email)
}

func NormalizeEmailAddress(email string) string {
	email = strings.TrimSpace(email)

	email = strings.ReplaceAll(email, "\n", "")
	email = strings.ReplaceAll(email, "\r", "")
	email = strings.ReplaceAll(email, "\t", "")

	email = regexp.MustCompile(`\s+`).ReplaceAllString(email, " ")

	parts := strings.Split(email, "<")
	if len(parts) == 2 {
		name := strings.TrimSpace(parts[0])
		addr := strings.TrimSpace(strings.Trim(parts[1], "<>"))
		if name != "" && addr != "" {
			return name + " <" + addr + ">"
		}
		if addr != "" {
			return addr
		}
	}

	return email
}

// RemoveInvisibleBlocks strips <style>, <script>, <noscript>, and <template>
// blocks (and their content) from HTML/text content before further processing.
func RemoveInvisibleBlocks(content string) string {
	if content == "" {
		return ""
	}
	// Case-insensitive, multiline, non-greedy matching for block tags and their content
	re := regexp.MustCompile(`(?is)<style\b[^>]*>[\s\S]*?</style>`)
	content = re.ReplaceAllString(content, "")
	re = regexp.MustCompile(`(?is)<script\b[^>]*>[\s\S]*?</script>`)
	content = re.ReplaceAllString(content, "")
	re = regexp.MustCompile(`(?is)<noscript\b[^>]*>[\s\S]*?</noscript>`)
	content = re.ReplaceAllString(content, "")
	re = regexp.MustCompile(`(?is)<template\b[^>]*>[\s\S]*?</template>`)
	content = re.ReplaceAllString(content, "")
	return content
}

// RemoveInvisibleChars strips zero-width and other invisible Unicode characters
// that can create visual gaps or artifacts in email text.
func RemoveInvisibleChars(s string) string {
	if s == "" {
		return ""
	}
	// U+00AD soft hyphen, U+034F combining grapheme joiner,
	// U+200B-U+200F zero-width spaces/joiners/directional marks,
	// U+2060 word joiner, U+FE0F variation selector-16, U+FEFF BOM
	re := regexp.MustCompile(`[\x{00AD}\x{034F}\x{200B}-\x{200F}\x{2060}\x{FE0F}\x{FEFF}]`)
	return re.ReplaceAllString(s, "")
}
