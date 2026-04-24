package models

type Todo struct {
	ID         string `json:"id"`
	UserID    string `json:"user_id"`
	TodoListID string `json:"todo_list_id,omitempty"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
	DueDate   string `json:"due_date,omitempty"`
	Priority string `json:"priority"`
	Category string `json:"category"`
	Notes    string `json:"notes,omitempty"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type TodoList struct {
	ID       string `json:"id"`
	UserID  string `json:"user_id"`
	Name    string `json:"name"`
	Color   string `json:"color,omitempty"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type CreateTodoRequest struct {
	Title     string `json:"title" binding:"required"`
	TodoListID string `json:"todo_list_id"`
	DueDate   string `json:"due_date"`
	Priority string `json:"priority"`
	Category string `json:"category"`
	Notes    string `json:"notes"`
}

type UpdateTodoRequest struct {
	Title     string `json:"title"`
	TodoListID string `json:"todo_list_id"`
	DueDate   string `json:"due_date"`
	Priority string `json:"priority"`
	Category string `json:"category"`
	Notes    string `json:"notes"`
	Completed string `json:"completed"`
}

type CreateTodoListRequest struct {
	Name  string `json:"name" binding:"required"`
	Color string `json:"color"`
}

type CompleteTodoRequest struct {
	Completed bool `json:"completed"`
}