import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Input,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { type SubmitEvent } from 'react'
import { fetchJson } from '../lib/api'

type LibrarySuggestionCreate = {
  title: string
  url: string
  note?: string | null
  item_type: string
  tags?: string | null
}

export const Route = createFileRoute('/library/suggest')({
  component: LibrarySuggestPage,
})

function LibrarySuggestPage() {
  const mutation = useMutation({
    mutationFn: (data: LibrarySuggestionCreate) =>
      fetchJson<{ message: string }>('/library/suggest', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = String(formData.get('title') || '').trim()
    const url = String(formData.get('url') || '').trim()
    const note = String(formData.get('note') || '').trim() || null
    const item_type = String(formData.get('item_type') || '').trim()
    const tags = String(formData.get('tags') || '').trim() || null

    if (!title || !url || !item_type) return

    mutation.mutate({ title, url, note, item_type, tags })
    e.currentTarget.reset()
  }

  return (
    <Stack gap={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold">
          Suggest a library item
        </Text>
        <Text color="gray.300">
          This hits the FastAPI /library/suggest endpoint.
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
              Title <Text as="span" color="red.400">*</Text>
            </Text>
            <Input name="title" required />
          </Box>
          <Box>
            <Text as="label" display="block" mb={1} fontWeight="medium">
              URL <Text as="span" color="red.400">*</Text>
            </Text>
            <Input name="url" placeholder="https://…" required />
          </Box>
          <Box>
            <Text as="label" display="block" mb={1} fontWeight="medium">
              Type <Text as="span" color="red.400">*</Text>
            </Text>
            <Input name="item_type" placeholder="book, article, video…" required />
          </Box>
          <Box>
            <Text as="label" display="block" mb={1} fontWeight="medium">
              Note
            </Text>
            <Textarea name="note" rows={3} />
          </Box>
          <Box>
            <Text as="label" display="block" mb={1} fontWeight="medium">
              Tags (comma separated)
            </Text>
            <Input name="tags" placeholder="ai, optimization, manufacturing" />
          </Box>
          <Button
            type="submit"
            colorScheme="teal"
            loading={mutation.isPending}
            alignSelf="flex-start"
          >
            Submit suggestion
          </Button>
          {mutation.isSuccess && (
            <Alert.Root status="success">
              <Alert.Title>Suggestion submitted</Alert.Title>
              <Alert.Description>
                Thanks! Your suggestion will be reviewed.
              </Alert.Description>
            </Alert.Root>
          )}
        </Stack>
      </form>
    </Stack>
  )
}

