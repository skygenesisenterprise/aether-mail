package controllers

import (
	"net/http"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"

	"github.com/gin-gonic/gin"
)

type SettingsController struct {
	settingsService *services.SettingsService
}

func NewSettingsController(settingsService *services.SettingsService) *SettingsController {
	return &SettingsController{
		settingsService: settingsService,
	}
}

func (c *SettingsController) GetSettings(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	if accountID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Account ID is required",
		})
		return
	}

	settings, err := c.settingsService.GetSettings(accountID)
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

func (c *SettingsController) UpdateSettings(ctx *gin.Context) {
	var req models.UpdateSettingsRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	settings, err := c.settingsService.UpdateSettings(&req)
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

func (c *SettingsController) GetVacation(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	if accountID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Account ID is required",
		})
		return
	}

	vacation, err := c.settingsService.GetVacationResponder(accountID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    vacation,
	})
}

func (c *SettingsController) UpdateVacation(ctx *gin.Context) {
	var req models.UpdateVacationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	accountID := ctx.Param("accountId")
	if accountID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Account ID is required",
		})
		return
	}

	vacation, err := c.settingsService.UpdateVacationResponder(&models.UpdateVacationResponderRequest{
		AccountID:    accountID,
		Enabled:    req.Enabled,
		Subject:   req.Subject,
		Message:   req.Message,
		StartDate: req.StartDate,
		EndDate:   req.EndDate,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    vacation,
	})
}

func (c *SettingsController) GetFilters(ctx *gin.Context) {
	accountID := ctx.Query("accountId")
	if accountID == "" {
		ctx.JSON(http.StatusBadRequest, models.ListResponse{
			Success: false,
			Error:   "Account ID is required",
		})
		return
	}

	filters, err := c.settingsService.GetFilterRules(accountID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    filters,
	})
}

func (c *SettingsController) CreateFilter(ctx *gin.Context) {
	var req models.CreateFilterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	filter, err := c.settingsService.CreateFilterRule(&models.CreateFilterRuleRequest{
		Name:      req.Name,
		Conditions: req.Conditions,
		Actions:  req.Actions,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    filter,
	})
}

func (c *SettingsController) UpdateFilter(ctx *gin.Context) {
	filterID := ctx.Param("id")
	if filterID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Filter ID is required",
		})
		return
	}

	var req models.UpdateFilterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	filter, err := c.settingsService.UpdateFilterRule(&models.UpdateFilterRuleRequest{
		RuleID:      filterID,
		Name:       req.Name,
		Conditions: req.Conditions,
		Actions:    req.Actions,
		Enabled:   req.Enabled,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    filter,
	})
}

func (c *SettingsController) DeleteFilter(ctx *gin.Context) {
	ruleID := ctx.Param("ruleId")
	if ruleID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Rule ID is required",
		})
		return
	}

	accountID := ctx.Query("accountId")
	if err := c.settingsService.DeleteFilterRule(accountID, ruleID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Filter deleted successfully",
	})
}

func (c *SettingsController) GetLabels(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	if accountID == "" {
		ctx.JSON(http.StatusBadRequest, models.ListResponse{
			Success: false,
			Error:   "Account ID is required",
		})
		return
	}

	labels, err := c.settingsService.GetLabels(accountID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	if labels == nil {
		labels = make([]*models.Label, 0)
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    labels,
	})
}

func (c *SettingsController) CreateLabel(ctx *gin.Context) {
	var req models.CreateLabelRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	label, err := c.settingsService.CreateLabel(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    label,
	})
}

func (c *SettingsController) UpdateLabel(ctx *gin.Context) {
	labelID := ctx.Param("labelId")
	if labelID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Label ID is required",
		})
		return
	}

	var req models.UpdateLabelRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	label, err := c.settingsService.UpdateLabel(labelID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    label,
	})
}

func (c *SettingsController) DeleteLabel(ctx *gin.Context) {
	labelID := ctx.Param("labelId")
	if labelID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Label ID is required",
		})
		return
	}

	if err := c.settingsService.DeleteLabel(labelID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Label deleted successfully",
	})
}

func (c *SettingsController) GetSignatures(ctx *gin.Context) {
	accountID := ctx.Query("accountId")
	if accountID == "" {
		accountID = ctx.GetString("userId")
	}

	signatures, err := c.settingsService.GetSignatures(accountID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	if signatures == nil {
		signatures = make([]*models.Signature, 0)
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    signatures,
	})
}

func (c *SettingsController) CreateSignature(ctx *gin.Context) {
	var req models.CreateSignatureRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	accountID := ctx.Query("accountId")
	if accountID == "" {
		accountID = ctx.GetString("userId")
	}

	signature, err := c.settingsService.CreateSignature(&models.CreateSignatureRequest{
		Name:      req.Name,
		Content:   req.Content,
		HTML:      req.HTML,
		IsDefault: req.IsDefault,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    signature,
	})
}

func (c *SettingsController) UpdateSignature(ctx *gin.Context) {
	signatureID := ctx.Param("id")
	if signatureID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Signature ID is required",
		})
		return
	}

	var req models.UpdateSignatureRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	signature, err := c.settingsService.UpdateSignature(&models.UpdateSignatureRequest{
		SignatureID: signatureID,
		Name:       req.Name,
		Content:    req.Content,
		HTML:       req.HTML,
		IsDefault:  req.IsDefault,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    signature,
	})
}

func (c *SettingsController) DeleteSignature(ctx *gin.Context) {
	signatureID := ctx.Param("id")
	if signatureID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Signature ID is required",
		})
		return
	}

	accountID := ctx.Query("accountId")
	if err := c.settingsService.DeleteSignature(accountID, signatureID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Signature deleted successfully",
	})
}

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type ListResponse struct {
	Success bool          `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Total  int          `json:"total,omitempty"`
	Error  string        `json:"error,omitempty"`
}