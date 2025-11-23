package apperror

type AppError struct {
    Code       string `json:"code"`
    Message    string `json:"message"`
    StatusCode int    `json:"statusCode"`
}

func (e *AppError) Error() string {
    return e.Message
}

func New(status int, code, message string) *AppError {
    return &AppError{
        Code:       code,
        Message:    message,
        StatusCode: status,
    }
}
