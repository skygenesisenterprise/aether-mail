package services

import (
	"fmt"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type TodoService struct {
	stalwart *StalwartService
}

func NewTodoService(stalwart *StalwartService) *TodoService {
	return &TodoService{
		stalwart: stalwart,
	}
}

func (s *TodoService) GetTodos(userID string, limit, offset int) ([]*models.Todo, error) {
	return nil, fmt.Errorf("not implemented")
}

func (s *TodoService) GetTodo(taskID string) (*models.Todo, error) {
	return nil, fmt.Errorf("not implemented")
}

func (s *TodoService) CreateTodo(userID string, req *models.CreateTodoRequest) (*models.Todo, error) {
	now := time.Now().UTC()
	return &models.Todo{
		ID:         fmt.Sprintf("todo-%d", now.UnixNano()),
		UserID:     userID,
		Title:     req.Title,
		DueDate:   req.DueDate,
		Priority:  req.Priority,
		Category:  req.Category,
		Notes:     req.Notes,
		Completed: false,
		CreatedAt: now.Format(time.RFC3339),
		UpdatedAt: now.Format(time.RFC3339),
	}, nil
}

func (s *TodoService) UpdateTodo(taskID string, req *models.UpdateTodoRequest) (*models.Todo, error) {
	return nil, fmt.Errorf("not implemented")
}

func (s *TodoService) DeleteTodo(taskID string) error {
	return fmt.Errorf("not implemented")
}

func (s *TodoService) CompleteTodo(taskID string, completed bool) (*models.Todo, error) {
	return nil, fmt.Errorf("not implemented")
}

func (s *TodoService) GetTodoLists(userID string) ([]*models.TodoList, error) {
	return nil, fmt.Errorf("not implemented")
}

func (s *TodoService) CreateTodoList(userID string, req *models.CreateTodoListRequest) (*models.TodoList, error) {
	now := time.Now().UTC()
	return &models.TodoList{
		ID:        fmt.Sprintf("todolist-%d", now.UnixNano()),
		UserID:   userID,
		Name:     req.Name,
		Color:    req.Color,
		CreatedAt: now.Format(time.RFC3339),
		UpdatedAt: now.Format(time.RFC3339),
	}, nil
}