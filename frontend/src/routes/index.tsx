import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Alert, Box, Button, Heading, HStack, Spinner, Stack, Text } from '@chakra-ui/react'
import { fetchJson } from '../lib/api'
import { sanityCheck } from '../lib/sanity-check'

type HealthResponse = { status: string }
type StatusResponse = { text: string | null }

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => fetchJson<HealthResponse>('/health'),
    retry: 1,
    retryDelay: 1000,
  })

  const statusQuery = useQuery({
    queryKey: ['status'],
    queryFn: () => fetchJson<StatusResponse>('/status/'),
    retry: 1,
    retryDelay: 1000,
  })

  const isLoading = healthQuery.isLoading || statusQuery.isLoading
  const error = healthQuery.error || statusQuery.error

  return (
    <Stack gap={6}>
      <Heading size="lg">Dryft Prep Playground</Heading>

      {isLoading && (
        <HStack>
          <Spinner />
          <Text>Checking backend health…</Text>
        </HStack>
      )}

      {error && (
        <Alert.Root status="error">
          <Alert.Title>Backend unreachable</Alert.Title>
          <Alert.Description>
            {error instanceof Error ? error.message : 'Make sure the FastAPI server is running on port 3001.'}
            <br />
            <Text fontSize="sm" mt={2}>
              Check console for details. API base: {import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}
            </Text>
          </Alert.Description>
        </Alert.Root>
      )}

      {!isLoading && !error && (
        <Alert.Root status={healthQuery.data?.status === 'ok' ? 'success' : 'warning'}>
          <Alert.Title>Health: {healthQuery.data?.status}</Alert.Title>
          <Alert.Description>
            Current status:{' '}
            {statusQuery.data?.text ? statusQuery.data.text : 'No status set yet.'}
          </Alert.Description>
        </Alert.Root>
      )}

      <Box>
        <Heading size="md" mb={3}>
          Features
        </Heading>
        <HStack wrap="wrap" gap={3}>
          <Link to="/leave-a-message">
            <Button colorScheme="teal" variant="outline">
              Leave a message
            </Button>
          </Link>
          <Link to="/library" search={{ page: 1, sort: 'recent', tag: undefined, item_type: undefined }}>
            <Button variant="outline">
              Library
            </Button>
          </Link>
          <Link to="/photos">
            <Button variant="outline">
              Photos
            </Button>
          </Link>
          <Link to="/spotify">
            <Button variant="outline">
              Spotify Now Playing
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="outline">
              Analytics (admin)
            </Button>
          </Link>
          <Link to="/admin/status">
            <Button variant="outline">
              Status (admin)
            </Button>
          </Link>
          <Link to="/admin/leave-a-message">
            <Button variant="outline">
              Leave a message (admin)
            </Button>
          </Link>
        </HStack>
      </Box>

      <Box>
        <Heading size="md" mb={3}>
          Debug
        </Heading>
        <Button
          onClick={() => sanityCheck()}
          variant="outline"
          size="sm"
        >
          Run API Sanity Check
        </Button>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Check browser console for detailed results
        </Text>
      </Box>
    </Stack>
  )
}
