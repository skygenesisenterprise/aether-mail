package controllers

import (
	"net/http"
	"strconv"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"

	"github.com/gin-gonic/gin"
)

type TodoController struct {
	todoService *services.TodoService
}

func NewTodoController(todoService *services.TodoService) *TodoController {
	return &TodoController{
		todoService: todoService,
	}
}

func (c *TodoController) GetTodos(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	if accountID == "" {
		ctx.JSON(http.StatusBadRequest, models.ListResponse{
			Success: false,
			Error:   "Account ID is required",
		})
		return
	}

	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(ctx.DefaultQuery("offset", "0"))

	todos, err := c.todoService.GetTodos(accountID, limit, offset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    todos,
	})
}

func (c *TodoController) GetTodo(ctx *gin.Context) {
	taskID := ctx.Param("taskId")
	if taskID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Task ID is required",
		})
		return
	}

	todo, err := c.todoService.GetTodo(taskID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    todo,
	})
}

func (c *TodoController) CreateTodo(ctx *gin.Context) {
	var req models.CreateTodoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	accountID := ctx.Param("accountId")
	todo, err := c.todoService.CreateTodo(accountID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    todo,
	})
}

func (c *TodoController) UpdateTodo(ctx *gin.Context) {
	taskID := ctx.Param("id")
	if taskID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Task ID is required",
		})
		return
	}

	var req models.UpdateTodoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	todo, err := c.todoService.UpdateTodo(taskID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    todo,
	})
}

func (c *TodoController) DeleteTodo(ctx *gin.Context) {
	taskID := ctx.Param("taskId")
	if taskID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Task ID is required",
		})
		return
	}

	if err := c.todoService.DeleteTodo(taskID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Task deleted successfully",
	})
}

func (c *TodoController) CompleteTodo(ctx *gin.Context) {
	taskID := ctx.Param("id")
	if taskID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Task ID is required",
		})
		return
	}

	var req models.CompleteTodoRequest
	ctx.ShouldBindJSON(&req)

	todo, err := c.todoService.CompleteTodo(taskID, req.Completed)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    todo,
	})
}

func (c *TodoController) GetTodoLists(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	if accountID == "" {
		ctx.JSON(http.StatusBadRequest, models.ListResponse{
			Success: false,
			Error:   "Account ID is required",
		})
		return
	}

	lists, err := c.todoService.GetTodoLists(accountID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    lists,
	})
}

func (c *TodoController) CreateTodoList(ctx *gin.Context) {
	var req models.CreateTodoListRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	accountID := ctx.Param("accountId")
	list, err := c.todoService.CreateTodoList(accountID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    list,
	})
}