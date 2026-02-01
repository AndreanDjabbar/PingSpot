import React from 'react'
import { FaCheck } from 'react-icons/fa'

const ResolvedReport = () => {
    return (
        <div>
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-300 shadow-sm mt-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-md">
                    <FaCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-sm text-green-800 font-semibold">
                        Laporan Terselesaikan
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                        Pembaruan progress dinonaktifkan
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ResolvedReport