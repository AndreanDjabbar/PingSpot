import { ErrorSection, SuccessSection } from '@/components'
import { IUploadProgressReportResponse } from '@/types'
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils'
import React from 'react'

interface ResponseSectionProps {
    isUploadProgressSuccess: boolean
    uploadProgressData: IUploadProgressReportResponse
    isUploadProgressError: boolean
    uploadProgressError: unknown
}

const ResponseSection: React.FC<ResponseSectionProps> = ({
    isUploadProgressSuccess,
    uploadProgressData,
    isUploadProgressError,
    uploadProgressError,
}) => {
  return (
    <div>
        {isUploadProgressSuccess && (
            <div className="mb-4">
                <SuccessSection message={uploadProgressData.message || "Progress berhasil diperbarui!"} />
            </div>
        )}

        {isUploadProgressError && (
            <div className="mb-4">
                <ErrorSection 
                    message={getErrorResponseMessage(uploadProgressError)} 
                    errors={getErrorResponseDetails(uploadProgressError)} 
                />
            </div>
        )}
    </div>
  )
}

export default ResponseSection