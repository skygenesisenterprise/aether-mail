package interfaces

import (
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type OrganizationRepository interface {
	Create(org *models.Organization) (*models.Organization, error)
	Update(org *models.Organization) (*models.Organization, error)
	FindByID(id string) (*models.Organization, error)
	FindAll() ([]*models.Organization, error)
}

type OrganizationMemberRepository interface {
	Create(member *models.OrganizationMember) (*models.OrganizationMember, error)
	Update(member *models.OrganizationMember) (*models.OrganizationMember, error)
	Delete(id string) error
	FindByOrganizationID(orgID string) ([]*models.OrganizationMember, error)
	FindByUserID(userID string) (*models.OrganizationMember, error)
	RemoveMember(orgID, userID string) error
}

type OrganizationDomainRepository interface {
	Create(domain *models.OrganizationDomain) (*models.OrganizationDomain, error)
	Update(domain *models.OrganizationDomain) (*models.OrganizationDomain, error)
	Delete(id string) error
	FindByOrganizationID(orgID string) ([]*models.OrganizationDomain, error)
	FindByID(id string) (*models.OrganizationDomain, error)
	Verify(domainID string) (*models.OrganizationDomain, error)
}