package config

import "server/pkg/utils/env"

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

func LoadRedisConfig() RedisConfig {
	return RedisConfig{
		Host: env.RedisHost(),
		Port: env.RedisPort(),
		DB:   0,
	}
}
