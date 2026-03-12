import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Button,
  Heading,
  Image,
  Link as ChakraLink,
  Spinner,
  Stack,
  Tag,
  Text,
  HStack,
} from '@chakra-ui/react'
import { fetchJson } from '../lib/api'

type LibraryItemPublic = {
  id: number
  title: string
  url: string
  note?: string | null
  rating?: number | null
  show_rating: boolean
  cover_image_url?: string | null
  item_type: string
  created_at: string
  updated_at?: string | null
  tags: string[]
}

export const Route = createFileRoute('/library/$itemId')({
  validateSearch: (): Record<string, never> => ({}),
  component: LibraryItemPage,
})

function LibraryItemPage() {
  const { itemId } = Route.useParams()

  const itemQuery = useQuery({
    queryKey: ['libraryItem', itemId],
    queryFn: () =>
      fetchJson<LibraryItemPublic>(`/library/${encodeURIComponent(itemId)}`),
  })

  if (itemQuery.isLoading) {
    return (
      <Stack>
        <Spinner />
        <Text>Loading item…</Text>
      </Stack>
    )
  }

  if (itemQuery.isError || !itemQuery.data) {
    return <Text color="red.300">Could not load library item.</Text>
  }

  const item = itemQuery.data

  const imageUrl = item.cover_image_url
    ? item.cover_image_url.startsWith('http')
      ? item.cover_image_url
      : `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}${item.cover_image_url}`
    : null

  return (
    <Stack gap={4}>
      <Link to="/library" search={{ page: 1, sort: 'recent', tag: undefined, item_type: undefined }}>
        <Button size="sm" variant="ghost">
          ← Back to library
        </Button>
      </Link>

      <HStack justify="space-between" align="flex-start">
        <Box flex={1}>
          <HStack mb={2} gap={2} align="center">
            <Heading size="lg">{item.title}</Heading>
            <Tag.Root size="sm" variant="subtle">
              <Tag.Label>{item.item_type}</Tag.Label>
            </Tag.Root>
          </HStack>
          {item.rating != null && item.show_rating && (
            <Text color="yellow.300" mb={2}>
              Rating: {item.rating}/5
            </Text>
          )}
          {item.url && (
            <ChakraLink href={item.url} target="_blank" rel="noopener noreferrer" color="teal.300" display="block" mb={2}>
              {item.url}
            </ChakraLink>
          )}
          <Text color="gray.200" mb={2}>{item.note}</Text>
          <Box mb={2}>
            {item.tags.map((t) => (
              <Tag.Root key={t} mr={2} mb={2}>
                <Tag.Label>{t}</Tag.Label>
              </Tag.Root>
            ))}
          </Box>
          <HStack gap={4} fontSize="sm" color="gray.400">
            <Text>Created: {new Date(item.created_at).toLocaleString()}</Text>
            {item.updated_at && item.updated_at !== item.created_at && (
              <Text>Updated: {new Date(item.updated_at).toLocaleString()}</Text>
            )}
          </HStack>
        </Box>
        {imageUrl && (
          <Box maxW="400px" ml={4}>
            <Image
              src={imageUrl}
              alt={item.title}
              borderRadius="md"
              maxW="100%"
              objectFit="contain"
            />
          </Box>
        )}
      </HStack>
    </Stack>
  )
}

