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
import { type SubmitEvent, useState } from 'react'
import { fetchJson } from '../lib/api'

type StatusCreate = {
  text: string
}

export const Route = createFileRoute('/admin/status')({
  component: StatusAdminPage,
})

function StatusAdminPage() {
  const [adminKey, setAdminKey] = useState('')

  const mutation = useMutation({
    mutationFn: (text: string) =>
      fetchJson<StatusCreate>('/status/', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
        body: JSON.stringify({ text }),
      }),
  })

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const text = String(formData.get('text') || '').trim()
    if (!text) return
    mutation.mutate(text)
  }

  return (
    <Stack gap={6}>
      <Box>
        <Alert.Root status="info">
          <Alert.Title>Update status banner</Alert.Title>
          <Alert.Description>
            This calls POST /status/ with the admin API key.
          </Alert.Description>
        </Alert.Root>
      </Box>

      <Box maxW="sm">
        <Text as="label" display="block" mb={1} fontWeight="medium">
          Admin API key
        </Text>
        <Input
          type="password"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
        />
      </Box>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(e as unknown as SubmitEvent<HTMLFormElement>)
        }}
      >
        <Box>
          <Text as="label" display="block" mb={1} fontWeight="medium">
            New status text <Text as="span" color="red.400">*</Text>
          </Text>
          <Textarea name="text" rows={3} required />
        </Box>
        <Button
          type="submit"
          colorScheme="teal"
          mt={3}
          loading={mutation.isPending}
          disabled={!adminKey}
        >
          Save status
        </Button>
      </form>

      {mutation.isSuccess && (
        <Alert.Root status="success">
          <Alert.Title>Status updated</Alert.Title>
        </Alert.Root>
      )}

      {mutation.isError && (
        <Alert.Root status="error">
          <Alert.Title>Could not update status</Alert.Title>
        </Alert.Root>
      )}
    </Stack>
  )
}

