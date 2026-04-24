package controllers

import (
	"net/http"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"

	"github.com/gin-gonic/gin"
)

type OrganizationController struct {
	organizationService *services.OrganizationService
}

func NewOrganizationController(orgService *services.OrganizationService) *OrganizationController {
	return &OrganizationController{
		organizationService: orgService,
	}
}

func (c *OrganizationController) GetOrganization(ctx *gin.Context) {
	org, err := c.organizationService.GetOrganization()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    org,
	})
}

func (c *OrganizationController) UpdateOrganization(ctx *gin.Context) {
	var req models.UpdateOrganizationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	org, err := c.organizationService.UpdateOrganization(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    org,
	})
}

func (c *OrganizationController) GetMembers(ctx *gin.Context) {
	members, err := c.organizationService.GetMembers()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    members,
	})
}

func (c *OrganizationController) InviteMember(ctx *gin.Context) {
	var req models.InviteMemberRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Email is required",
		})
		return
	}

	member, err := c.organizationService.InviteMember(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    member,
	})
}

func (c *OrganizationController) RemoveMember(ctx *gin.Context) {
	userID := ctx.Param("userId")
	if userID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "User ID is required",
		})
		return
	}

	if err := c.organizationService.RemoveMember(userID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Member removed successfully",
	})
}

func (c *OrganizationController) GetDomains(ctx *gin.Context) {
	domains, err := c.organizationService.GetDomains()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    domains,
	})
}

func (c *OrganizationController) AddDomain(ctx *gin.Context) {
	var req struct {
		Domain string `json:"domain" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Domain is required",
		})
		return
	}

	domain, err := c.organizationService.AddDomain(req.Domain)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    domain,
	})
}

func (c *OrganizationController) VerifyDomain(ctx *gin.Context) {
	domainID := ctx.Param("domainId")
	if domainID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Domain ID is required",
		})
		return
	}

	domain, err := c.organizationService.VerifyDomain(domainID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    domain,
	})
}