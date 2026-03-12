import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Input,
  Spinner,
  Stack,
  Textarea,
  Text,
  HStack,
} from '@chakra-ui/react'
import { type SubmitEvent, useState } from 'react'
import { fetchJson } from '../lib/api'

type GuestbookEntryPublic = {
  id: number
  name: string
  message: string
  website?: string | null
  created_at: string
}

type GuestbookPage = {
  items: GuestbookEntryPublic[]
  total: number
  page: number
  per_page: number
  pages: number
}

type GuestbookEntryCreate = {
  name: string
  message: string
  website?: string | null
}

export const Route = createFileRoute('/leave-a-message')({
  component: GuestbookPageComponent,
})

function GuestbookPageComponent() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const entriesQuery = useQuery({
    queryKey: ['guestbook', { page }],
    queryFn: () =>
      fetchJson<GuestbookPage>(`/guestbook/?page=${page}&per_page=20`),
  })

  const mutation = useMutation({
    mutationFn: (data: GuestbookEntryCreate) =>
      fetchJson<GuestbookEntryPublic>('/guestbook/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestbook'] })
    },
  })

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const message = String(formData.get('message') || '').trim()
    const website = String(formData.get('website') || '').trim() || null

    if (!name || !message) return

    mutation.mutate({ name, message, website })
    e.currentTarget.reset()
  }

  return (
    <Stack gap={8}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Leave a message
        </Text>
        <Text color="gray.300">
          This hits the FastAPI guestbook endpoints with TanStack Query and Chakra UI.
        </Text>
      </Box>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(e as unknown as SubmitEvent<HTMLFormElement>)
        }}
      >
        <Stack gap={4}>
          <Box>
            <Text as="label" display="block" mb={1} fontWeight="medium">
              Name <Text as="span" color="red.400">*</Text>
            </Text>
            <Input name="name" placeholder="Your name" required />
          </Box>
          <Box>
            <Text as="label" display="block" mb={1} fontWeight="medium">
              Website
            </Text>
            <Input name="website" placeholder="https://example.com" />
          </Box>
          <Box>
            <Text as="label" display="block" mb={1} fontWeight="medium">
              Message <Text as="span" color="red.400">*</Text>
            </Text>
            <Textarea name="message" rows={4} placeholder="Say hello!" required />
          </Box>
          <Button
            type="submit"
            colorScheme="teal"
            loading={mutation.isPending}
            alignSelf="flex-start"
          >
            Submit
          </Button>
          {mutation.isSuccess && (
            <Alert.Root status="success">
              <Alert.Title>Thanks!</Alert.Title>
              <Alert.Description>
                Your message was submitted and is waiting for approval.
              </Alert.Description>
            </Alert.Root>
          )}
          {mutation.isError && (
            <Alert.Root status="error">
              <Alert.Title>Could not submit</Alert.Title>
              <Alert.Description>Something went wrong posting your message.</Alert.Description>
            </Alert.Root>
          )}
        </Stack>
      </form>

      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={3}>
          Recent messages
        </Text>

        {entriesQuery.isLoading && (
          <HStack>
            <Spinner />
            <Text>Loading messages…</Text>
          </HStack>
        )}

        {entriesQuery.isError && (
          <Alert.Root status="error">
            <Alert.Title>Could not load guestbook</Alert.Title>
          </Alert.Root>
        )}

        {entriesQuery.data && entriesQuery.data.items.length === 0 && (
          <Text color="gray.400">No messages yet.</Text>
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
                  {new Date(entry.created_at).toLocaleString()}
                </Text>
              </HStack>
              <Text mt={1}>{entry.message}</Text>
              {entry.website && (
                <Text mt={1} fontSize="sm" color="teal.300">
                  <a href={entry.website} target="_blank" rel="noopener noreferrer">
                    {entry.website}
                  </a>
                </Text>
              )}
            </Box>
          ))}
        </Stack>

        {entriesQuery.data && entriesQuery.data.pages > 1 && (
          <HStack mt={4} justify="space-between">
            <Button
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Text fontSize="sm">
              Page {entriesQuery.data.page} of {entriesQuery.data.pages}
            </Text>
            <Button
              size="sm"
              onClick={() =>
                setPage((p) =>
                  entriesQuery.data ? Math.min(entriesQuery.data.pages, p + 1) : p,
                )
              }
              disabled={
                !entriesQuery.data || page >= entriesQuery.data.pages
              }
            >
              Next
            </Button>
          </HStack>
        )}
      </Box>
    </Stack>
  )
}
