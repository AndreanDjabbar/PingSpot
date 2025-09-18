package mainutils

import (
	"bytes"
	"crypto/rand"
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

func SendEmail(to, username, context, verificationLink string) error {
	if to == "" || username == "" || verificationLink == "" {
		return fmt.Errorf("required fields cannot be empty")
	}

	email := env.EmailEmail()
	password := env.EmailPassword()

	if email == "" || password == "" {
		return fmt.Errorf("email credentials not configured")
	}

	m := gomail.NewMessage()
	m.SetHeader("From", email)
	m.SetHeader("To", to)
	m.SetHeader("Subject", "Verifikasi Akun PingSpot")

	body, err := RenderAuthValidationEmail(verificationLink, username, context)
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

func authValidationTemplate(title string) string {
	return `<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>{{.Title}}</title>
	<!--[if mso]>
	<noscript>
		<xml>
			<o:OfficeDocumentSettings>
				<o:PixelsPerInch>96</o:PixelsPerInch>
			</o:OfficeDocumentSettings>
		</xml>
	</noscript>
	<![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc; line-height: 1.6;">
	<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
		<tr>
			<td align="center" style="padding: 40px 20px;">
				<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
					<tr>
						<td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
							<h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
								PingSpot
							</h1>
							<p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
								Selamat datang di dunia terhubung Anda
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 50px 40px;">
							<h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">
								Halo {{.UserName}}! 👋
							</h2>
							<p style="margin: 0 0 25px; color: #475569; font-size: 16px; text-align: center; line-height: 1.7;">
								Terima kasih telah bergabung dengan PingSpot! Untuk mulai menggunakan dan mengamankan akun Anda, silakan verifikasi alamat email Anda.
							</p>
							<div style="text-align: center; margin: 35px 0;">
								<a href="{{.VerificationLink}}" 
								   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; text-align: center; min-width: 200px;">
									Verifikasi Akun Saya
								</a>
							</div>
							<div style="margin: 30px 0; padding: 20px; background-color: #f1f5f9; border-radius: 12px; border-left: 4px solid #667eea;">
								<p style="margin: 0 0 10px; color: #475569; font-size: 14px; font-weight: 600;">
									Tombol tidak berfungsi?
								</p>
								<p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
									Salin dan tempel link ini ke browser Anda:
								</p>
								<p style="margin: 8px 0 0; word-break: break-all;">
									<a href="{{.VerificationLink}}" style="color: #667eea; text-decoration: none; font-size: 14px;">
										{{.VerificationLink}}
									</a>
								</p>
							</div>
							<div style="margin: 30px 0; text-align: center;">
								<p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
									🔒 Link ini akan kedaluwarsa dalam 5 menit demi keamanan Anda.<br>
									Jika Anda tidak membuat akun, abaikan email ini.
								</p>
							</div>
						</td>
					</tr>
					<tr>
						<td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
							<div style="margin-bottom: 20px;">
								<a href="#" style="display: inline-block; margin: 0 10px; width: 36px; height: 36px; background-color: #667eea; border-radius: 50%; line-height: 36px; text-decoration: none;">
									<span style="color: #ffffff; font-size: 16px;">f</span>
								</a>
								<a href="#" style="display: inline-block; margin: 0 10px; width: 36px; height: 36px; background-color: #667eea; border-radius: 50%; line-height: 36px; text-decoration: none;">
									<span style="color: #ffffff; font-size: 16px;">t</span>
								</a>
								<a href="#" style="display: inline-block; margin: 0 10px; width: 36px; height: 36px; background-color: #667eea; border-radius: 50%; line-height: 36px; text-decoration: none;">
									<span style="color: #ffffff; font-size: 16px;">in</span>
								</a>
							</div>
							<p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
								© 2025 PingSpot. Hak cipta dilindungi undang-undang.
							</p>
							<p style="margin: 0; color: #94a3b8; font-size: 12px;">
								Pertanyaan? Hubungi kami di
								<a href="mailto:support@pingspot.com" style="color: #667eea; text-decoration: none;">
									support@pingspot.com
								</a>
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`
}

func RenderAuthValidationEmail(verificationLink, userName, validationName string) (string, error) {
	if verificationLink == "" || userName == "" {
		return "", fmt.Errorf("verificationLink and userName cannot be empty")
	}

	tmpl, err := template.New(validationName).Parse(authValidationTemplate(validationName))
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	data := struct {
		VerificationLink string
		UserName         string
		Title            string
	}{
		VerificationLink: verificationLink,
		UserName:         userName,
		Title:            validationName,
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
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