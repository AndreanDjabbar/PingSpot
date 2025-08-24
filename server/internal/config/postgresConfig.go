package config

import "server2/pkg/utils/envUtils"

type PostgresConfig struct {
    Host     string
    Port     string
    User     string
    Password string
    DBName   string
    SSLMode  string
}

func LoadPostgresConfig() PostgresConfig {
    return PostgresConfig{
        Host:     envUtils.PostgreHost(),
        Port:     envUtils.PostgrePort(),
        User:     envUtils.PostgreUser(),
        Password: envUtils.PostgrePassword(),
        DBName:   envUtils.PostgreDB(),
        SSLMode:  "disable",
    }
}
