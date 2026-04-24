package interfaces

import (
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type TodoRepository interface {
	Create(todo *models.Todo) (*models.Todo, error)
	Update(todo *models.Todo) (*models.Todo, error)
	Delete(id string) error
	FindByID(id string) (*models.Todo, error)
	FindByUserID(userID string, limit, offset int) ([]*models.Todo, error)
	FindByTodoListID(todoListID string) ([]*models.Todo, error)
	FindCompleted(userID string) ([]*models.Todo, error)
	FindPending(userID string) ([]*models.Todo, error)
	Complete(id string, completed bool) (*models.Todo, error)
}

type TodoListRepository interface {
	Create(list *models.TodoList) (*models.TodoList, error)
	Update(list *models.TodoList) (*models.TodoList, error)
	Delete(id string) error
	FindByID(id string) (*models.TodoList, error)
	FindByUserID(userID string) ([]*models.TodoList, error)
}