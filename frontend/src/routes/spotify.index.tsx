import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  HStack,
  Image,
  Spinner,
  Stack,
  Text,
  Tag,
} from '@chakra-ui/react'
import { fetchJson, type ApiError } from '../lib/api'

type SpotifyNowPlaying = {
  is_playing: boolean
  track?: string
  artist?: string[]
  artist_uri?: string[]
  album?: string
  album_uri?: string
  image?: string | null
  progress?: number | null
  duration?: number
  explicit?: boolean
  popularity?: number
  track_url?: string
}

export const Route = createFileRoute('/spotify/')({
  component: SpotifyPage,
})

function SpotifyPage() {
  const query = useQuery({
    queryKey: ['spotifyNowPlaying'],
    queryFn: () => fetchJson<SpotifyNowPlaying>('/spotify/now-playing'),
    retry: false,
  })

  const refetch = () => query.refetch()

  const data = query.data
  const isPlaying = data?.is_playing
  const artistNames = data?.artist?.join(', ')
  const progressPct =
    data?.progress != null && data?.duration
      ? Math.min(100, Math.max(0, (data.progress / data.duration) * 100))
      : null

  return (
    <Stack gap={6}>
      <Text fontSize="2xl" fontWeight="bold">
        Spotify now playing
      </Text>

      {query.isLoading && (
        <HStack>
          <Spinner />
          <Text>Fetching track…</Text>
        </HStack>
      )}

      {query.error && (
        <Alert.Root status="error">
          <Alert.Title>Could not fetch now playing</Alert.Title>
          <Alert.Description>
            {(query.error as ApiError).status === 503
              ? 'Spotify data is temporarily unavailable.'
              : 'Check that the backend and Spotify integration are configured.'}
          </Alert.Description>
        </Alert.Root>
      )}

      {data && (
        <Stack gap={4}>
          <HStack align="center" gap={4}>
            {data.image && (
              <Image src={data.image} boxSize="96px" borderRadius="md" />
            )}
            <Box>
              <HStack gap={2} align="center" mb={1}>
                <Text fontWeight="bold" fontSize="lg">
                  {data.track ?? (isPlaying ? 'Unknown track' : 'Nothing playing')}
                </Text>
                {data.explicit && (
                  <Tag.Root size="sm" variant="solid" colorPalette="red">
                    <Tag.Label>E</Tag.Label>
                  </Tag.Root>
                )}
              </HStack>
              <Text color="gray.300">
                {artistNames || 'Unknown artist'}
                {data.album && ` — ${data.album}`}
              </Text>
              <HStack gap={3} mt={1} fontSize="sm" color="gray.400">
                <Text>{isPlaying ? 'Now playing' : 'Paused'}</Text>
                {data.popularity != null && (
                  <Text>Popularity: {data.popularity}</Text>
                )}
              </HStack>
            </Box>
          </HStack>

          {progressPct != null && (
            <Box>
              <Box
                h="6px"
                borderRadius="full"
                bg="gray.700"
                overflow="hidden"
              >
                <Box
                  h="100%"
                  width={`${progressPct}%`}
                  bg="green.400"
                  transition="width 0.2s linear"
                />
              </Box>
              <HStack justify="space-between" fontSize="xs" color="gray.400" mt={1}>
                <Text>
                  {Math.floor((data!.progress ?? 0) / 1000)}s /{' '}
                  {Math.floor((data!.duration ?? 0) / 1000)}s
                </Text>
                {data.track_url && (
                  <a
                    href={data.track_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Text color="green.300">Open in Spotify</Text>
                  </a>
                )}
              </HStack>
            </Box>
          )}
        </Stack>
      )}

      <Button onClick={refetch} variant="outline" alignSelf="flex-start">
        Refresh
      </Button>
    </Stack>
  )
}

