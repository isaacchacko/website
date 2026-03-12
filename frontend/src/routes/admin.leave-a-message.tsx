import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  HStack,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import { type SubmitEvent, useState } from 'react'
import { fetchJson } from '../lib/api'

type GuestbookEntryPublic = {
  id: number
  name: string
  message: string
  website?: string | null
  is_approved: boolean
  is_rejected: boolean
  created_at: string
}

type GuestbookPage = {
  items: GuestbookEntryPublic[]
  total: number
  page: number
  per_page: number
  pages: number
}

export const Route = createFileRoute('/admin/leave-a-message')({
  component: LeaveAMessageAdminPage,
})

function LeaveAMessageAdminPage() {
  const [adminKey, setAdminKey] = useState('')
  const queryClient = useQueryClient()

  const entriesQuery = useQuery({
    queryKey: ['guestbook-admin', { adminKey }],
    enabled: false,
    queryFn: () =>
      fetchJson<GuestbookPage>('/guestbook/?page=1&per_page=50', {
        headers: { 'x-admin-key': adminKey },
      }),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) =>
      fetchJson(`/guestbook/${id}/approve`, {
        method: 'PATCH',
        headers: { 'x-admin-key': adminKey },
      }),
    onSuccess: () => {
      // Query is manually controlled (enabled: false), so explicitly refetch
      entriesQuery.refetch()
      queryClient.invalidateQueries({ queryKey: ['guestbook-admin'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) =>
      fetchJson(`/guestbook/${id}/reject`, {
        method: 'PATCH',
        headers: { 'x-admin-key': adminKey },
      }),
    onSuccess: () => {
      entriesQuery.refetch()
      queryClient.invalidateQueries({ queryKey: ['guestbook-admin'] })
    },
  })

  const handleKeySubmit = (e: SubmitEvent) => {
    e.preventDefault()
    if (!adminKey) return
    entriesQuery.refetch()
  }

  return (
    <Stack gap={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold">
          Leave-a-message admin
        </Text>
        <Text color="gray.300">
          Approve or delete guestbook entries using the admin API key.
        </Text>
      </Box>

      <Box as="form" onSubmit={handleKeySubmit}>
        <HStack align="flex-end" gap={3}>
          <Box>
            <Text as="label" display="block" mb={1} fontWeight="medium">
              Admin API key
            </Text>
            <Input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
            />
          </Box>
          <Button type="submit" colorScheme="teal">
            Load entries
          </Button>
        </HStack>
      </Box>

      {!adminKey && (
        <Alert.Root status="info">
          <Alert.Title>Enter admin key</Alert.Title>
          <Alert.Description>
            Provide the admin API key to manage entries.
          </Alert.Description>
        </Alert.Root>
      )}

      {entriesQuery.isLoading && (
        <Text color="gray.400">Loading entries…</Text>
      )}

      {entriesQuery.isError && adminKey && (
        <Alert.Root status="error">
          <Alert.Title>Could not load entries</Alert.Title>
          <Alert.Description>
            Check that the admin key is correct and the backend is running.
          </Alert.Description>
        </Alert.Root>
      )}

      <Stack gap={3}>
        {entriesQuery.data?.items.map((entry) => (
          <Box
            key={entry.id}
            borderWidth="1px"
            borderRadius="md"
            p={3}
            bg="gray.900"
          >
            <HStack justify="space-between" mb={1}>
              <Text fontWeight="bold">{entry.name}</Text>
              <Text fontSize="xs" color="gray.400">
                #{entry.id}{' '}
                {entry.is_rejected
                  ? '(rejected)'
                  : entry.is_approved
                  ? '(approved)'
                  : '(pending review)'}
              </Text>
            </HStack>
            <Text mb={2}>{entry.message}</Text>
            {entry.website && (
              <Text mb={2} fontSize="sm" color="teal.300">
                <a href={entry.website} target="_blank" rel="noopener noreferrer">
                  {entry.website}
                </a>
              </Text>
            )}
            <Text fontSize="xs" color="gray.500" mb={2}>
              {new Date(entry.created_at).toLocaleString()}
            </Text>
            <HStack gap={2}>
              <Button
                size="sm"
                colorScheme="teal"
                variant={entry.is_approved && !entry.is_rejected ? 'solid' : 'outline'}
                onClick={() => approveMutation.mutate(entry.id)}
                loading={approveMutation.isPending}
              >
                Approve
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                variant={entry.is_rejected ? 'solid' : 'outline'}
                onClick={() => rejectMutation.mutate(entry.id)}
                loading={rejectMutation.isPending}
              >
                Reject
              </Button>
            </HStack>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}

