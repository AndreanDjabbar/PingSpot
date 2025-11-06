package mainutils

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"html/template"
	"math/big"
	"server/pkg/utils/env"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateRandomCode(length int) (string, error) {
	if length <= 0 {
		return "", fmt.Errorf("length must be greater than 0")
	}

	characters := "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	code := make([]byte, length)
	for i := range code {
		index, err := rand.Int(rand.Reader, big.NewInt(int64(len(characters))))
		if err != nil {
			return "", fmt.Errorf("failed to generate random number: %w", err)
		}
		code[i] = characters[index.Int64()]
	}
	return string(code), nil
}

func GenerateJWT(userID uint, JWTSecret []byte, email, username, fullName string) (string, error) {
	if len(JWTSecret) == 0 {
		return "", fmt.Errorf("JWT secret cannot be empty")
	}

	claims := jwt.MapClaims{
		"user_id":   userID,
		"email":     email,
		"username":  username,
		"full_name": fullName,
		"exp":       time.Now().Add(time.Hour * 10).Unix(),
		"iat":       time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JWTSecret)
}

func GetJWTClaims(c *fiber.Ctx) (jwt.MapClaims, error) {
	token := c.Locals("user")
	if token == nil {
		return nil, fmt.Errorf("no JWT token found in context")
	}

	jwtToken, ok := token.(*jwt.Token)
	if !ok {
		return nil, fmt.Errorf("invalid JWT token type")
	}

	if claims, ok := jwtToken.Claims.(jwt.MapClaims); ok && jwtToken.Valid {
		return claims, nil
	}
	return nil, fmt.Errorf("invalid JWT token")
}

func ParseJWT(tokenString string, JWTSecret []byte) (jwt.MapClaims, error) {
	if len(JWTSecret) == 0 {
		return nil, fmt.Errorf("JWT secret cannot be empty")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return JWTSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, fmt.Errorf("invalid token")
}

type EmailType string

const (
	EmailTypeVerification     EmailType = "verification"
	EmailTypePasswordReset    EmailType = "password_reset"
	EmailTypeProgressReminder EmailType = "progress_reminder"
)

type EmailData struct {
	To            string
	Subject       string
	RecipientName string
	EmailType     EmailType
	BodyTempate   string
	TemplateData  map[string]any
}

func SendEmail(data EmailData) error {
	if data.To == "" || data.RecipientName == "" {
		return fmt.Errorf("recipient email and name cannot be empty")
	}

	email := env.EmailEmail()
	password := env.EmailPassword()

	if email == "" || password == "" {
		return fmt.Errorf("email credentials not configured")
	}

	m := gomail.NewMessage()
	m.SetHeader("From", email)
	m.SetHeader("To", data.To)
	m.SetHeader("Subject", data.Subject)
	
	body, err := RenderEmailTemplate(data)

	if err != nil {
		return fmt.Errorf("failed to render email template: %w", err)
	}
	m.SetBody("text/html", body)
	d := gomail.NewDialer("smtp.gmail.com", 587, email, password)
	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	return nil
}

func RenderEmailTemplate(data EmailData) (string, error) {
	var templateHTML string
	var templateData any

	switch data.EmailType {
	case EmailTypeVerification:
		verificationLink, ok := data.TemplateData["VerificationLink"].(string)
		if !ok || verificationLink == "" {
			return "", fmt.Errorf("verification link is required for verification email")
		}
		templateHTML = data.BodyTempate
		templateData = struct {
			UserName         string
			VerificationLink string
		}{
			UserName:         data.RecipientName,
			VerificationLink: verificationLink,
		}

	case EmailTypePasswordReset:
		resetLink, ok := data.TemplateData["ResetLink"].(string)
		if !ok || resetLink == "" {
			return "", fmt.Errorf("reset link is required for password reset email")
		}
		templateHTML = data.BodyTempate
		templateData = struct {
			UserName  string
			ResetLink string
		}{
			UserName:  data.RecipientName,
			ResetLink: resetLink,
		}

	case EmailTypeProgressReminder:
		reportTitle, ok := data.TemplateData["ReportTitle"].(string)
		if !ok || reportTitle == "" {
			return "", fmt.Errorf("report title is required for progress reminder email")
		}
		reportLink, ok := data.TemplateData["ReportLink"].(string)
		if !ok || reportLink == "" {
			return "", fmt.Errorf("report link is required for progress reminder email")
		}
		daysRemaining, ok := data.TemplateData["DaysRemaining"].(int)
		if !ok {
			return "", fmt.Errorf("days remaining is required for progress reminder email")
		}
		templateHTML = data.BodyTempate
		templateData = struct {
			UserName      string
			ReportTitle   string
			ReportLink    string
			DaysRemaining int
		}{
			UserName:      data.RecipientName,
			ReportTitle:   reportTitle,
			ReportLink:    reportLink,
			DaysRemaining: daysRemaining,
		}

	default:
		return "", fmt.Errorf("unsupported email type: %s", data.EmailType)
	}

	tmpl, err := template.New(string(data.EmailType)).Parse(templateHTML)
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, templateData); err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}

	return buf.String(), nil
}

func StrPtrOrNil(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func BoolPtrOrNil(b bool) *bool {
	if !b {
		return nil
	}
	return &b
}

func Int64PtrOrNil(i int64) *int64 {
	if i == 0 {
		return nil
	}
	return &i
}

func StringToTimePtr(s string) (*time.Time, error) {
	if s == "" {
		return nil, nil
	}
	layout := time.RFC3339
	value, err := time.Parse(layout, s)
	if err != nil {
		return nil, fmt.Errorf("failed to convert string to time.Time: %w", err)
	}
	return &value, nil
}

func StringToFloat64(s string) (float64, error) {
	if s == "" {
		return 0.0, nil
	}
	value, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0.0, fmt.Errorf("failed to convert string to float64: %w", err)
	}

	return value, nil
}

func StringToBool(s string) (*bool, error) {
	if s == "" {
		return nil, nil
	}
	value, err := strconv.ParseBool(s)
	if err != nil {
		return nil, fmt.Errorf("failed to convert string to bool: %w", err)
	}
	return &value, nil
}

func StringToUint(s string) (uint, error) {
	if s == "" {
		return 0, nil
	}
	value, err := strconv.ParseUint(s, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("failed to convert string to uint: %w", err)
	}
	return uint(value), nil
}


func MustJSON(v any) []byte {
	b, _ := json.Marshal(v)
	return b
}