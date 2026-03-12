import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Button,
  HStack,
  Heading,
  Image,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  Text,
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

type LibraryPage = {
  items: LibraryItemPublic[]
  total: number
  page: number
  per_page: number
  pages: number
}

type TagWithCount = {
  id: number
  name: string
  count: number
}

export const Route = createFileRoute('/library')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page ?? 1),
      sort: String(search.sort ?? 'recent'),
      tag: (search.tag as string | undefined) ?? undefined,
      item_type: (search.item_type as string | undefined) ?? undefined,
    }
  },
  component: LibraryPageComponent,
})

function LibraryPageComponent() {
  const search = useSearch({ from: '/library' })
  const { page, sort, tag, item_type } = search

  const tagsQuery = useQuery({
    queryKey: ['libraryTags'],
    queryFn: () => fetchJson<TagWithCount[]>('/library/tags'),
  })

  const itemsQuery = useQuery({
    queryKey: ['library', { page, sort, tag, item_type }],
    queryFn: () =>
      fetchJson<LibraryPage>(
        `/library/?page=${page}&per_page=20&sort=${sort}` +
          (tag ? `&tag=${encodeURIComponent(tag)}` : '') +
          (item_type ? `&item_type=${encodeURIComponent(item_type)}` : ''),
      ),
  })

  return (
    <Stack gap={6}>
      <Heading size="lg">Reading library</Heading>

      <HStack gap={4} align="center">
        <Box>
          <Text fontSize="sm" mb={1}>
            Sort
          </Text>
          <select
            value={sort}
            onChange={(e) => {
              window.location.assign(
                `/library?sort=${e.target.value}` +
                  (tag ? `&tag=${encodeURIComponent(tag)}` : '') +
                  (item_type
                    ? `&item_type=${encodeURIComponent(item_type)}`
                    : ''),
              )
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              borderWidth: '1px',
              backgroundColor: '#111827',
              color: 'white',
              fontSize: '0.875rem',
            }}
          >
            <option value="recent">Most recent</option>
            <option value="alpha">Alphabetical</option>
            <option value="rating">Rating</option>
          </select>
        </Box>
      </HStack>

      <Box>
        <HStack gap={2} flexWrap="wrap">
          {tagsQuery.isLoading && <Spinner size="sm" />}
          {tagsQuery.data?.map((t) => (
            <Link
              key={t.id}
              to="/library"
              search={{ ...search, tag: t.name, page: 1 }}
            >
              <Tag.Root
                size="sm"
                cursor="pointer"
                variant={tag === t.name ? 'solid' : 'subtle'}
                colorPalette={tag === t.name ? 'teal' : undefined}
              >
                <Tag.Label>
                  {t.name} ({t.count})
                </Tag.Label>
              </Tag.Root>
            </Link>
          ))}
        </HStack>
      </Box>

      {itemsQuery.isLoading && (
        <HStack>
          <Spinner />
          <Text>Loading items…</Text>
        </HStack>
      )}

      {itemsQuery.isError && (
        <Text color="red.300">Could not load library items.</Text>
      )}

      {itemsQuery.data && itemsQuery.data.items.length === 0 && (
        <Text color="gray.400">No items match these filters.</Text>
      )}

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {itemsQuery.data?.items.map((item) => (
          <Link
            key={item.id}
            to="/library/$itemId"
            params={{ itemId: String(item.id) }}
            search={{} as any}
          >
            <Box
              borderWidth="1px"
              borderRadius="md"
              p={3}
              bg="gray.900"
              _hover={{ borderColor: 'teal.400' }}
            >
              {item.cover_image_url && (
                <Image
                  src={item.cover_image_url.startsWith('http') ? item.cover_image_url : `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}${item.cover_image_url}`}
                  alt={item.title}
                  borderRadius="md"
                  mb={2}
                  maxH="200px"
                  objectFit="cover"
                  w="100%"
                />
              )}
              <HStack justify="space-between" mb={1}>
                <Text fontWeight="bold">{item.title}</Text>
                <Tag.Root size="sm" variant="subtle">
                  <Tag.Label>{item.item_type}</Tag.Label>
                </Tag.Root>
              </HStack>
              {item.rating != null && item.show_rating && (
                <Text fontSize="sm" color="yellow.300">
                  Rating: {item.rating}/5
                </Text>
              )}
              <Text
                mt={1}
                fontSize="sm"
                color="gray.300"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.note}
              </Text>
              <HStack mt={2} gap={2} flexWrap="wrap">
                {item.tags.map((tagName) => (
                  <Tag.Root key={tagName} size="sm" variant="subtle">
                    <Tag.Label>{tagName}</Tag.Label>
                  </Tag.Root>
                ))}
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={2}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </Box>
          </Link>
        ))}
      </SimpleGrid>

      {itemsQuery.data && itemsQuery.data.pages > 1 && (
        <HStack justify="space-between" mt={4}>
          <Button
            size="sm"
            onClick={() =>
              (window.location.href = `/library?page=${Math.max(
                1,
                page - 1,
              )}&sort=${sort}`)
            }
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Text fontSize="sm">
            Page {itemsQuery.data.page} of {itemsQuery.data.pages}
          </Text>
          <Button
            size="sm"
            onClick={() =>
              (window.location.href = `/library?page=${Math.min(
                itemsQuery.data!.pages,
                page + 1,
              )}&sort=${sort}`)
            }
            disabled={page >= itemsQuery.data.pages}
          >
            Next
          </Button>
        </HStack>
      )}
    </Stack>
  )
}

