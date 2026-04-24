package models

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

type Filter struct {
	ID         string `json:"id"`
	UserID    string `json:"user_id"`
	Name     string `json:"name"`
	Conditions string `json:"conditions"`
	Actions  string `json:"actions"`
	Enabled  bool   `json:"enabled"`
	Priority int    `json:"priority"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type CreateFilterRequest struct {
	Name      string `json:"name" binding:"required"`
	Conditions string `json:"conditions" binding:"required"`
	Actions  string `json:"actions" binding:"required"`
	Priority int    `json:"priority"`
}

type UpdateFilterRequest struct {
	Name      string `json:"name"`
	Conditions string `json:"conditions"`
	Actions  string `json:"actions"`
	Enabled  bool   `json:"enabled"`
	Priority int    `json:"priority"`
}

type Label struct {
	ID       string `json:"id"`
	UserID   string `json:"user_id"`
	Name     string `json:"name"`
	Color    string `json:"color,omitempty"`
	ParentID string `json:"parent_id,omitempty"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type CreateLabelRequest struct {
	Name     string `json:"name" binding:"required"`
	Color    string `json:"color"`
	ParentID string `json:"parent_id"`
}

type UpdateLabelRequest struct {
	Name     string `json:"name"`
	Color    string `json:"color"`
}