package config

import "server/pkg/utils/envUtils"

type RedisConfig struct {
    Host     string
    Port     string
    Password string
    DB       int
}

func LoadRedisConfig() RedisConfig {
    return RedisConfig{
        Host:     envUtils.RedisHost(),
        Port:     envUtils.RedisPort(),
        DB:       0,
    }
}
