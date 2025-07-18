package envUtils

import "os"

func Port() string            { return os.Getenv("PORT") }
func Host() string            { return os.Getenv("HOST") }
func LogLevel() string        { return os.Getenv("LOG_LEVEL") }
func NodeEnv() string         { return os.Getenv("NODE_ENV") }
func ClientURL() string       { return os.Getenv("CLIENT_URL") }
func GithubRepoURL() string   { return os.Getenv("GITHUB_REPO_URL") }
func PostgreHost() string     { return os.Getenv("POSTGRE_HOST") }
func PostgrePort() string     { return os.Getenv("POSTGRE_PORT") }
func PostgreUser() string     { return os.Getenv("POSTGRE_USER") }
func PostgrePassword() string { return os.Getenv("POSTGRE_PASSWORD") }
func PostgreDB() string       { return os.Getenv("POSTGRE_DB") }
func RedisHost() string       { return os.Getenv("REDIS_HOST") }
func RedisPort() string       { return os.Getenv("REDIS_PORT") }
func JWTSecret() string       { return os.Getenv("JWT_SECRET") }
func EmailPassword() string   { return os.Getenv("EMAIL_PASSWORD") }
func EmailEmail() string      { return os.Getenv("EMAIL_EMAIL") }
