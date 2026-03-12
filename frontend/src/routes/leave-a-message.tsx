import { createFileRoute } from "@tanstack/react-router";
import { Container, Heading, Field, Input, Stack, Textarea, Button, Alert } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "../lib/api";

export const Route = createFileRoute("/leave-a-message")({
  component: Page
});

function Page() {

  const mutation = useMutation({
    mutationFn: (data: { name: string; message: string }) =>
      fetchJson('/guestbook/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })

  function submitForm(e: HTMLFormElement) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '').trim()
    const message = String(fd.get('message') || '').trim()
    const url = String(fd.get('url') || '').trim()
    if (!name || !message || !url) return
    mutation.mutate({ name, message })
  }

  return (
    <Container maxW={{ base: 'full', sm: '2xl', md: '3xl' }} py={8}>
      <Heading size="2xl" mb={6}>
        Leave a Message!
      </Heading>
      <form onSubmit={e => {
        submitForm(e);
      }}>

        <Stack gap={4}>
          <Field.Root required>
            <Field.Label>Name</Field.Label>
            <Input name="name" placeholder="Who are you?" />
          </Field.Root>
          <Field.Root required>
            <Field.Label>Message</Field.Label>
            <Textarea name="message" placeholder="What's your message?" />
          </Field.Root>
          <Field.Root required>
            <Field.Label>Website</Field.Label>
            <Textarea name="url" placeholder="What's your return address?" />
          </Field.Root>
          <Button type="submit" alignSelf="flex-start" loading={mutation.isPending}>
            Send
          </Button>
          {mutation.isSuccess && (
            <Alert.Root status="success">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Message sent!</Alert.Title>
              </Alert.Content>
            </Alert.Root>
          )}

          {mutation.isError && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Something went wrong</Alert.Title>
              </Alert.Content>
            </Alert.Root>
          )}
        </Stack>
      </form>
    </Container>
  )
}
