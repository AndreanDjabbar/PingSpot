package config

import (
	"fmt"
	"net/http"
	"server/pkg/utils/envUtils"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

func InitGoogleAuth() error {
    googleClientId := envUtils.GoogleClientID()
    googleClientSecret := envUtils.GoogleClientSecret()
    googleCallbackURL := envUtils.GoogleCallbackURL()
    googleSecretSessionKey := envUtils.GoogleSecretSessionKey()

    if googleClientId == "" || googleClientSecret == "" || googleCallbackURL == "" || googleSecretSessionKey == "" {
        return fmt.Errorf("missing required Google Auth environment variables")
    }

    goth.UseProviders(
        google.New(
            googleClientId,
            googleClientSecret,
            googleCallbackURL,
            "email", "profile",
        ),
    )

    maxAge := 60 * 60 * 24 * 30
    isProduction := envUtils.IsProduction()
    httpOnly := envUtils.IsHTTPOnly()

    store := sessions.NewCookieStore([]byte(googleSecretSessionKey))
    store.MaxAge(maxAge)
    store.Options.Path = "/"
    store.Options.HttpOnly = httpOnly
    store.Options.Secure = isProduction
    store.Options.SameSite = http.SameSiteLaxMode

    gothic.Store = store

    return nil
}
