import { PieceMetadataSchema } from '../piece-metadata-entity'
import { GetParams, PieceMetadataService } from './piece-metadata-service'
import { PieceMetadata, PieceMetadataSummary } from '@activepieces/pieces-framework'
import { AllPiecesStats, pieceStatsService } from './piece-stats-service'
import { StatusCodes } from 'http-status-codes'
import { ActivepiecesError, ErrorCode } from '@activepieces/shared'

const CLOUD_API_URL = 'https://activepieces-cdn.fra1.digitaloceanspaces.com/pieces/metadata'

const handleHttpErrors = async (response: Response) => {
    if (response.status === StatusCodes.NOT_FOUND) {
        throw new ActivepiecesError({
            code: ErrorCode.ENTITY_NOT_FOUND,
            params: {
                message: 'piece not found',
            },
        })
    }

    if (response.status !== StatusCodes.OK) {
        throw new Error(await response.text())
    }
}

export const CloudPieceMetadataService = (): PieceMetadataService => {
    return {
        async list(): Promise<PieceMetadataSummary[]> {
            const response = await fetch(`${CLOUD_API_URL}/latest.json`)

            await handleHttpErrors(response)

            return await response.json() as PieceMetadataSummary[]
        },

        async get({ name, version }: GetParams): Promise<PieceMetadata> {
            const response = await fetch(`${CLOUD_API_URL}/${name}/${version}.json`)

            await handleHttpErrors(response)

            return await response.json() as PieceMetadata
        },

        async create(): Promise<PieceMetadataSchema> {
            throw new Error('operation not supported')
        },

        async stats(): Promise<AllPiecesStats> {
            return await pieceStatsService.get()
        },
    }
}
