package validation

import (
	"github.com/go-playground/validator/v10"
)

var Validate *validator.Validate

func init() {
	Validate = validator.New()
}

func FormatCreateReportValidationErrors(err error) map[string]string {
	errors := map[string]string{}
	if err == nil {
		return errors
	}
	for _, e := range err.(validator.ValidationErrors) {
		switch e.Field() {
			case "ReportTitle":
				if e.Tag() == "required" {
					errors["reportTitle"] = "Judul laporan wajib diisi"
				}
				if e.Tag() == "max" {
					errors["reportTitle"] = "Judul laporan maksimal 200 karakter"
				}
			case "ReportType":
				if e.Tag() == "required" {
					errors["reportType"] = "Tipe laporan wajib diisi"
				}
				if e.Tag() == "oneof" {
					errors["reportType"] = "Tipe laporan harus salah satu antara INFRASTRUCTURE, ENVIRONMENT, SAFETY, OTHER"
				}
			case "ReportDescription":
				if e.Tag() == "required" {
					errors["reportDescription"] = "Deskripsi laporan wajib diisi"
				}
			case "DetailLocation":
				if e.Tag() == "required" {
					errors["detailLocation"] = "Detail lokasi wajib diisi"
				}
			case "Latitude":
				if e.Tag() == "required" {
					errors["latitude"] = "Latitude wajib diisi"
				}
			case "Longitude":
				if e.Tag() == "required" {
					errors["longitude"] = "Longitude wajib diisi"
				}
			case "DisplayName":
				if e.Tag() == "max" {
					errors["displayName"] = "Display name maksimal 255 karakter"
				}
			case "AddressType":
				if e.Tag() == "max" {
					errors["addressType"] = "Tipe alamat maksimal 100 karakter"
				}
			case "Country":
				if e.Tag() == "max" {
					errors["country"] = "Negara maksimal 100 karakter"
				}
			case "CountryCode":
				if e.Tag() == "max" {
					errors["countryCode"] = "Kode negara maksimal 10 karakter"
				}
			case "Region":
				if e.Tag() == "max" {
					errors["region"] = "Region maksimal 100 karakter"
				}
			case "PostCode":
				if e.Tag() == "max" {
					errors["postCode"] = "Kode pos maksimal 20 karakter"
				}
			case "County":
				if e.Tag() == "max" {
					errors["county"] = "County maksimal 200 karakter"
				}
			case "State":
				if e.Tag() == "max" {
					errors["state"] = "State maksimal 200 karakter"
				}
			case "Road":
				if e.Tag() == "max" {
					errors["road"] = "Road maksimal 200 karakter"
				}
			case "Village":
				if e.Tag() == "max" {
					errors["village"] = "Village maksimal 200 karakter"
				}
			case "Suburb":
				if e.Tag() == "max" {
					errors["suburb"] = "Suburb maksimal 200 karakter"
				}
			case "Image1URL":
				if e.Tag() == "max" {
					errors["image1Url"] = "URL gambar 1 maksimal 255 karakter"
				}
			case "Image2URL":
				if e.Tag() == "max" {
					errors["image2Url"] = "URL gambar 2 maksimal 255 karakter"
				}
			case "Image3URL":
				if e.Tag() == "max" {
					errors["image3Url"] = "URL gambar 3 maksimal 255 karakter"
				}
			case "Image4URL":
				if e.Tag() == "max" {
					errors["image4Url"] = "URL gambar 4 maksimal 255 karakter"
				}
			case "Image5URL":
				if e.Tag() == "max" {
					errors["image5Url"] = "URL gambar 5 maksimal 255 karakter"
				}
		}
	}
	return errors
}