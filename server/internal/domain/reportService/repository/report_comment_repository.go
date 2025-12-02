package repository

import (
	"context"
	"server/internal/domain/model"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type ReportCommentRepository interface {
	Create(ctx context.Context, report *model.ReportComment) (*model.ReportComment, error)
}

type reportCommentRepository struct {
	db *mongo.Client
	collection *mongo.Collection
}

func NewReportCommentRepository(db *mongo.Client) ReportCommentRepository {
	return &reportCommentRepository{
		db: db,
		collection: db.Database("report_service").Collection("report_comments"),
	}
}

func (r *reportCommentRepository) Create(ctx context.Context, comment *model.ReportComment) (*model.ReportComment, error) {
	comment.ID = primitive.NewObjectID()

	_, err := r.collection.InsertOne(ctx, comment)
	if err != nil {
		return nil, err
	}
	
	return comment, nil
}