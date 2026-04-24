package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"

	"github.com/gin-gonic/gin"
)

type MeetingController struct {
	meetingService *services.MeetingService
}

func NewMeetingController(meetingService *services.MeetingService) *MeetingController {
	return &MeetingController{
		meetingService: meetingService,
	}
}

func (c *MeetingController) GetMeetings(ctx *gin.Context) {
	userID := ctx.GetString("userId")
	if userID == "" {
		ctx.JSON(http.StatusUnauthorized, models.Response{
			Success: false,
			Error:   "Unauthorized",
		})
		return
	}

	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(ctx.DefaultQuery("offset", "0"))

	meetings, err := c.meetingService.GetMeetings(userID, limit, offset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    meetings,
	})
}

func (c *MeetingController) GetMeeting(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	meeting, err := c.meetingService.GetMeeting(meetingID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    meeting,
	})
}

func (c *MeetingController) CreateMeeting(ctx *gin.Context) {
	userID := ctx.GetString("userId")
	if userID == "" {
		ctx.JSON(http.StatusUnauthorized, models.Response{
			Success: false,
			Error:   "Unauthorized",
		})
		return
	}

	var req models.CreateMeetingRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	meeting, err := c.meetingService.CreateMeeting(userID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    meeting,
	})
}

func (c *MeetingController) UpdateMeeting(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	var req models.UpdateMeetingRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	meeting, err := c.meetingService.UpdateMeeting(meetingID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    meeting,
	})
}

func (c *MeetingController) DeleteMeeting(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	if err := c.meetingService.DeleteMeeting(meetingID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Meeting deleted successfully",
	})
}

func (c *MeetingController) JoinMeeting(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	var req models.JoinMeetingRequest
	ctx.ShouldBindJSON(&req)

	meeting, err := c.meetingService.JoinMeeting(meetingID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    meeting,
	})
}

func (c *MeetingController) StartMeeting(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	meeting, err := c.meetingService.StartMeeting(meetingID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    meeting,
	})
}

func (c *MeetingController) EndMeeting(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	meeting, err := c.meetingService.EndMeeting(meetingID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    meeting,
	})
}

func (c *MeetingController) LeaveMeeting(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	if err := c.meetingService.LeaveMeeting(meetingID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Left meeting successfully",
	})
}

func (c *MeetingController) GetConversations(ctx *gin.Context) {
	userID := ctx.GetString("userId")
	if userID == "" {
		ctx.JSON(http.StatusUnauthorized, models.ListResponse{
			Success: false,
			Error:   "Unauthorized",
		})
		return
	}

	conversations, err := c.meetingService.GetConversations(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    conversations,
	})
}

func (c *MeetingController) GetConversation(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	if conversationID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Conversation ID is required",
		})
		return
	}

	conversation, err := c.meetingService.GetConversation(conversationID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    conversation,
	})
}

func (c *MeetingController) StartCall(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	if conversationID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Conversation ID is required",
		})
		return
	}

	conversation, err := c.meetingService.StartCall(conversationID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    conversation,
	})
}

func (c *MeetingController) AcceptCall(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	if conversationID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Conversation ID is required",
		})
		return
	}

	if err := c.meetingService.AcceptCall(conversationID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Call accepted",
	})
}

func (c *MeetingController) DeclineCall(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	if conversationID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Conversation ID is required",
		})
		return
	}

	if err := c.meetingService.DeclineCall(conversationID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Call declined",
	})
}

func (c *MeetingController) ToggleHold(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	action := ctx.Param("action")
	if conversationID == "" || action == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Conversation ID and action are required",
		})
		return
	}

	var err error
	if action == "hold" {
		err = c.meetingService.HoldCall(conversationID)
	} else if action == "resume" {
		err = c.meetingService.ResumeCall(conversationID)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: fmt.Sprintf("Call %sd", action),
	})
}

func (c *MeetingController) ToggleMute(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	action := ctx.Param("action")
	if conversationID == "" || action == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Conversation ID and action are required",
		})
		return
	}

	var err error
	if action == "mute" {
		err = c.meetingService.Mute(conversationID)
	} else if action == "unmute" {
		err = c.meetingService.Unmute(conversationID)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: fmt.Sprintf("Microphone %sd", action),
	})
}

func (c *MeetingController) ToggleVideo(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	action := ctx.Param("action")
	if conversationID == "" || action == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Conversation ID and action are required",
		})
		return
	}

	var err error
	if action == "video-on" {
		err = c.meetingService.VideoOn(conversationID)
	} else if action == "video-off" {
		err = c.meetingService.VideoOff(conversationID)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: fmt.Sprintf("Video %s", action),
	})
}

func (c *MeetingController) ToggleScreenShare(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	action := ctx.Param("action")
	if conversationID == "" || action == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Conversation ID and action are required",
		})
		return
	}

	var err error
	if action == "screenshare" {
		err = c.meetingService.ScreenShare(conversationID)
	} else if action == "screenshare-stop" {
		err = c.meetingService.StopScreenShare(conversationID)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: fmt.Sprintf("Screen share %s", action),
	})
}

func (c *MeetingController) GetMessages(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	if conversationID == "" {
		ctx.JSON(http.StatusBadRequest, models.ListResponse{
			Success: false,
			Error:   "Conversation ID is required",
		})
		return
	}

	messages, err := c.meetingService.GetMessages(conversationID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    messages,
	})
}

func (c *MeetingController) GetMessage(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	messageID := ctx.Param("messageId")
	if conversationID == "" || messageID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Conversation ID and Message ID are required",
		})
		return
	}

	message, err := c.meetingService.GetMessage(conversationID, messageID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    message,
	})
}

func (c *MeetingController) SendMessage(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	if conversationID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Conversation ID is required",
		})
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Content is required",
		})
		return
	}

	senderID := ctx.GetString("userId")
	message, err := c.meetingService.SendMessage(conversationID, senderID, req.Content)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    message,
	})
}

func (c *MeetingController) DeleteMessage(ctx *gin.Context) {
	conversationID := ctx.Param("conversationId")
	messageID := ctx.Param("messageId")
	if conversationID == "" || messageID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Conversation ID and Message ID are required",
		})
		return
	}

	if err := c.meetingService.DeleteMessage(conversationID, messageID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Message deleted successfully",
	})
}

func (c *MeetingController) GetParticipants(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.ListResponse{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	participants, err := c.meetingService.GetParticipants(meetingID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    participants,
	})
}

func (c *MeetingController) InviteParticipants(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	var req models.InviteParticipantRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Email is required",
		})
		return
	}

	if err := c.meetingService.InviteParticipants(meetingID, []string{req.Email}); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Participant invited successfully",
	})
}

func (c *MeetingController) RemoveParticipant(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	userID := ctx.Param("userId")
	if meetingID == "" || userID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID and User ID are required",
		})
		return
	}

	if err := c.meetingService.RemoveParticipant(meetingID, userID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Participant removed successfully",
	})
}

func (c *MeetingController) MuteParticipant(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	userID := ctx.Param("userId")
	if meetingID == "" || userID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID and User ID are required",
		})
		return
	}

	if err := c.meetingService.MuteParticipant(meetingID, userID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Participant muted successfully",
	})
}

func (c *MeetingController) RemoveFromCall(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	userID := ctx.Param("userId")
	if meetingID == "" || userID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID and User ID are required",
		})
		return
	}

	if err := c.meetingService.RemoveFromCall(meetingID, userID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Participant removed from call successfully",
	})
}

func (c *MeetingController) GetRecordings(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.ListResponse{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	recordings, err := c.meetingService.GetRecordings(meetingID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    recordings,
	})
}

func (c *MeetingController) GetRecording(ctx *gin.Context) {
	recordingID := ctx.Param("recordingId")
	if recordingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Recording ID is required",
		})
		return
	}

	recording, err := c.meetingService.GetRecording(recordingID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    recording,
	})
}

func (c *MeetingController) StartRecording(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	recording, err := c.meetingService.StartRecording(meetingID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    recording,
	})
}

func (c *MeetingController) StopRecording(ctx *gin.Context) {
	meetingID := ctx.Param("meetingId")
	if meetingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Meeting ID is required",
		})
		return
	}

	recording, err := c.meetingService.StopRecording(meetingID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    recording,
	})
}

func (c *MeetingController) DeleteRecording(ctx *gin.Context) {
	recordingID := ctx.Param("recordingId")
	if recordingID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Recording ID is required",
		})
		return
	}

	if err := c.meetingService.DeleteRecording(recordingID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Recording deleted successfully",
	})
}

func (c *MeetingController) GetSettings(ctx *gin.Context) {
	userID := ctx.GetString("userId")
	if userID == "" {
		ctx.JSON(http.StatusUnauthorized, models.Response{
			Success: false,
			Error:   "Unauthorized",
		})
		return
	}

	settings, err := c.meetingService.GetMeetingSettings(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    settings,
	})
}

func (c *MeetingController) UpdateSettings(ctx *gin.Context) {
	userID := ctx.GetString("userId")
	if userID == "" {
		ctx.JSON(http.StatusUnauthorized, models.Response{
			Success: false,
			Error:   "Unauthorized",
		})
		return
	}

	var req models.MeetingSettings
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	settings, err := c.meetingService.UpdateMeetingSettings(userID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    settings,
	})
}