package repository

import (
	"context"
	"regexp"
	"server/internal/domain/model"
	"strings"

	"gorm.io/gorm"
)

type UserRepository interface {
	UpdateByEmail(ctx context.Context, email string, updatedUser *model.User) (*model.User, error)
	GetByID(ctx context.Context, userID uint) (*model.User, error)
	GetByIDs(ctx context.Context, userIDs []uint) ([]model.User, error)
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	Save(ctx context.Context, user *model.User) error
	Create(ctx context.Context, user *model.User) error
	CreateTX(ctx context.Context, tx *gorm.DB, user *model.User) (*model.User, error)
	FullTextSearchUsers(ctx context.Context, query string, limit int) (*[]model.User, error)
	FullTextSearchUsersPaginated(ctx context.Context, searchQuery string, limit int, cursorID uint) (*[]model.User, error)
	UpdateFullNameTX(ctx context.Context, tx *gorm.DB, userID uint, fullName string) error
	Get(ctx context.Context) (*[]model.User, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Get(ctx context.Context) (*[]model.User, error) {
	var users []model.User
	if err := r.db.WithContext(ctx).Find(&users).Error; err != nil {
		return nil, err
	}
	return &users, nil
}

func (r *userRepository) FullTextSearchUsers(ctx context.Context, searchQuery string, limit int) (*[]model.User, error) {
	var users []model.User

	if strings.TrimSpace(searchQuery) == "" {
		return &users, nil
	}

	searchQuery = strings.ToLower(searchQuery)
	searchQuery = regexp.MustCompile(`[^a-z0-9\s]`).ReplaceAllString(searchQuery, "")
	searchQuery = strings.TrimSpace(searchQuery)
	searchQuery = regexp.MustCompile(`\s+`).ReplaceAllString(searchQuery, " & ")
	searchQuery += ":*"

	err := r.db.WithContext(ctx).
		Preload("Profile").
		Where("search_vector @@ to_tsquery('simple', ?)", searchQuery).
		Order(gorm.Expr("ts_rank(search_vector, to_tsquery('simple', ?)) DESC", searchQuery)).
		Limit(limit).
		Find(&users).Error

	return &users, err
}

func (r *userRepository) FullTextSearchUsersPaginated(ctx context.Context, searchQuery string, limit int, cursorID uint) (*[]model.User, error) {
	var users []model.User

	if strings.TrimSpace(searchQuery) == "" {
		return &users, nil
	}
	
	searchQuery = strings.ToLower(searchQuery)
	searchQuery = regexp.MustCompile(`[^a-z0-9\s]`).ReplaceAllString(searchQuery, "")
	searchQuery = strings.TrimSpace(searchQuery)
	searchQuery = regexp.MustCompile(`\s+`).ReplaceAllString(searchQuery, " & ")
	searchQuery += ":*"
	
	query := r.db.WithContext(ctx).
		Preload("Profile").
		Where("search_vector @@ to_tsquery('simple', ?)", searchQuery).
		Order(gorm.Expr("ts_rank(search_vector, to_tsquery('simple', ?)) DESC", searchQuery))

	if cursorID != 0 {
		query = query.Where("id > ?", cursorID)
	}

	err := query.Limit(limit).Find(&users).Error
	
	return &users, err
}

func (r *userRepository) GetByIDs(ctx context.Context, userIDs []uint) ([]model.User, error) {
	var users []model.User
	if err := r.db.WithContext(ctx).
		Preload("Profile").
		Where("id IN ?", userIDs).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) UpdateByEmail(ctx context.Context, email string, updatedUser *model.User) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).Model(&user).Updates(updatedUser).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByID(ctx context.Context, userID uint) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).Preload("Profile").First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Create(ctx context.Context, user *model.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) CreateTX(ctx context.Context, tx *gorm.DB, user *model.User) (*model.User, error) {
	if err := tx.WithContext(ctx).Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepository) Save(ctx context.Context, user *model.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepository) UpdateFullNameTX(ctx context.Context, tx *gorm.DB, userID uint, fullName string) error {
	return tx.WithContext(ctx).Model(&model.User{}).
		Where("id = ?", userID).
		Update("full_name", fullName).Error
}
