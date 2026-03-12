import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  HStack,
  Input,
  Spinner,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react'
import { type ChangeEvent, useState } from 'react'
import { fetchJson } from '../lib/api'

type AnalyticsSummary = {
  total_views_today: number
  total_views_week: number
  total_views_all_time: number
  top_pages: { path: string; count: number }[]
  top_referrers: { referrer: string; count: number }[]
  device_breakdown: { device: string; count: number }[]
  browser_breakdown: { browser: string; count: number }[]
}

type AnalyticsEventsPage = {
  items: {
    id: number
    path: string
    referrer?: string | null
    device_type?: string | null
    browser?: string | null
    country?: string | null
    duration_seconds?: number | null
    created_at: string
  }[]
  total: number
  page: number
  per_page: number
  pages: number
}

export const Route = createFileRoute('/admin/analytics')({
  component: AnalyticsAdminPage,
})

function AnalyticsAdminPage() {
  const [adminKey, setAdminKey] = useState('')

  const summaryQuery = useQuery({
    queryKey: ['analyticsSummary', { adminKey }],
    enabled: false,
    queryFn: () =>
      fetchJson<AnalyticsSummary>('/analytics/summary?days=7', {
        headers: { 'x-admin-key': adminKey },
      }),
  })

  const eventsQuery = useQuery({
    queryKey: ['analyticsEvents', { adminKey }],
    enabled: false,
    queryFn: () =>
      fetchJson<AnalyticsEventsPage>('/analytics/events?page=1&per_page=50', {
        headers: { 'x-admin-key': adminKey },
      }),
  })

  const onAdminKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAdminKey(e.target.value)
  }

  return (
    <Stack gap={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold">
          Analytics admin
        </Text>
        <Text color="gray.300">
          View summary metrics and recent events from the FastAPI analytics
          endpoints.
        </Text>
      </Box>

      <Box maxW="sm">
        <Text as="label" display="block" mb={1} fontWeight="medium">
          Admin API key
        </Text>
        <HStack gap={2} align="flex-end">
          <Input
            type="password"
            value={adminKey}
            onChange={onAdminKeyChange}
          />
          <Button
            colorScheme="teal"
            onClick={() => {
              if (!adminKey) return
              summaryQuery.refetch()
              eventsQuery.refetch()
            }}
          >
            Load analytics
          </Button>
        </HStack>
      </Box>

      {!adminKey && (
        <Alert.Root status="info">
          <Alert.Title>Enter admin key</Alert.Title>
          <Alert.Description>
            Provide the admin API key to load analytics data.
          </Alert.Description>
        </Alert.Root>
      )}

      {summaryQuery.isLoading && (
        <HStack>
          <Spinner />
          <Text>Loading summary…</Text>
        </HStack>
      )}

      {summaryQuery.isError && adminKey && (
        <Alert.Root status="error">
          <Alert.Title>Could not load summary</Alert.Title>
        </Alert.Root>
      )}

      {summaryQuery.data && (
        <HStack gap={4}>
          <Box>
            <Text fontSize="sm" color="gray.400">
              Today
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {summaryQuery.data.total_views_today}
            </Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.400">
              Last 7 days
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {summaryQuery.data.total_views_week}
            </Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.400">
              All time
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {summaryQuery.data.total_views_all_time}
            </Text>
          </Box>
        </HStack>
      )}

      {summaryQuery.data && (
        <Stack gap={4}>
          <Box>
            <Text fontWeight="semibold" mb={2}>
              Top pages (7 days)
            </Text>
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Path</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Views</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {summaryQuery.data.top_pages.map((p) => (
                  <Table.Row key={p.path}>
                    <Table.Cell>{p.path}</Table.Cell>
                    <Table.Cell textAlign="end">{p.count}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          <Box>
            <Text fontWeight="semibold" mb={2}>
              Top referrers
            </Text>
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Referrer</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Views</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {summaryQuery.data.top_referrers.map((r) => (
                  <Table.Row key={r.referrer}>
                    <Table.Cell>{r.referrer || '(direct)'}</Table.Cell>
                    <Table.Cell textAlign="end">{r.count}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          <Box>
            <Text fontWeight="semibold" mb={2}>
              Device breakdown
            </Text>
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Device</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Count</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {summaryQuery.data.device_breakdown.map((d) => (
                  <Table.Row key={d.device}>
                    <Table.Cell>{d.device || '(unknown)'}</Table.Cell>
                    <Table.Cell textAlign="end">{d.count}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          <Box>
            <Text fontWeight="semibold" mb={2}>
              Browser breakdown
            </Text>
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Browser</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Count</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {summaryQuery.data.browser_breakdown.map((b) => (
                  <Table.Row key={b.browser}>
                    <Table.Cell>{b.browser || '(unknown)'}</Table.Cell>
                    <Table.Cell textAlign="end">{b.count}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Stack>
      )}

      {eventsQuery.isLoading && adminKey && (
        <HStack>
          <Spinner />
          <Text>Loading events…</Text>
        </HStack>
      )}

      {eventsQuery.data && (
        <Box>
          <Text fontWeight="semibold" mb={2}>
            Recent events
          </Text>
          <Table.Root size="sm" variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>ID</Table.ColumnHeader>
                <Table.ColumnHeader>Path</Table.ColumnHeader>
                <Table.ColumnHeader>Referrer</Table.ColumnHeader>
                <Table.ColumnHeader>Device</Table.ColumnHeader>
                <Table.ColumnHeader>Browser</Table.ColumnHeader>
                <Table.ColumnHeader>Country</Table.ColumnHeader>
                <Table.ColumnHeader>Duration</Table.ColumnHeader>
                <Table.ColumnHeader>Time</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {eventsQuery.data.items.map((e) => (
                <Table.Row key={e.id}>
                  <Table.Cell>#{e.id}</Table.Cell>
                  <Table.Cell>{e.path}</Table.Cell>
                  <Table.Cell>{e.referrer || '(direct)'}</Table.Cell>
                  <Table.Cell>{e.device_type || '(unknown)'}</Table.Cell>
                  <Table.Cell>{e.browser || '(unknown)'}</Table.Cell>
                  <Table.Cell>{e.country || '(unknown)'}</Table.Cell>
                  <Table.Cell>
                    {e.duration_seconds != null
                      ? `${e.duration_seconds}s`
                      : '-'}
                  </Table.Cell>
                  <Table.Cell>{new Date(e.created_at).toLocaleString()}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Stack>
  )
}

