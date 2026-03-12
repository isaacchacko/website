import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  HStack,
  Image,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Button,
} from '@chakra-ui/react'
import { useState } from 'react'
import { fetchJson } from '../lib/api'

type PhotoPublic = {
  id: number
  filename: string
  original_filename: string
  caption?: string | null
  uploaded_at: string
  url: string
}

type PhotosPage = {
  items: PhotoPublic[]
  total: number
  page: number
  per_page: number
  pages: number
}

export const Route = createFileRoute('/photos')({
  component: PhotosPageComponent,
})

function PhotosPageComponent() {
  const [page, setPage] = useState(1)

  const photosQuery = useQuery({
    queryKey: ['photos', { page }],
    queryFn: () =>
      fetchJson<PhotosPage>(`/photos/?page=${page}&per_page=12`),
  })

  return (
    <Stack gap={6}>
      <Text fontSize="2xl" fontWeight="bold">
        Photo gallery
      </Text>

      {photosQuery.isLoading && (
        <HStack>
          <Spinner />
          <Text>Loading photos…</Text>
        </HStack>
      )}

      {photosQuery.isError && (
        <Text color="red.300">Could not load photos.</Text>
      )}

      <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
        {photosQuery.data?.items.map((photo) => {
          const imageUrl = photo.url.startsWith('http')
            ? photo.url
            : `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}${photo.url}`
          console.log("imageUrl: ", imageUrl);
          return (
            <Box key={photo.id} borderWidth="1px" borderRadius="md" p={2} bg="gray.900">
              <Image
                src={imageUrl}
                alt={photo.original_filename}
                borderRadius="md"
                objectFit="cover"
                w="100%"
                h="200px"
              />
              <Stack mt={2} gap={1}>
                <Text fontSize="xs" color="gray.400">
                  {photo.original_filename}
                </Text>
                {photo.caption && (
                  <Text
                    fontSize="sm"
                    color="gray.300"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {photo.caption}
                  </Text>
                )}
                <Text fontSize="xs" color="gray.500">
                  {new Date(photo.uploaded_at).toLocaleString()}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  File: {photo.original_filename}
                </Text>
              </Stack>
            </Box>
          )
        })}
      </SimpleGrid>

      {photosQuery.data && photosQuery.data.pages > 1 && (
        <HStack justify="space-between" mt={4}>
          <Button
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Text fontSize="sm">
            Page {photosQuery.data.page} of {photosQuery.data.pages}
          </Text>
          <Button
            size="sm"
            onClick={() =>
              setPage((p) =>
                photosQuery.data ? Math.min(photosQuery.data.pages, p + 1) : p,
              )
            }
            disabled={
              !photosQuery.data || page >= photosQuery.data.pages
            }
          >
            Next
          </Button>
        </HStack>
      )}
    </Stack>
  )
}

