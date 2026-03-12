import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Box, Container } from '@chakra-ui/react'
import { Navbar } from '../components/Navbar'

export const Route = createRootRoute({
  component: () => (
    <Box minH="100vh" bg="gray.950" color="gray.100">
      <Navbar />
      <Container maxW="4xl" py={8}>
        <Outlet />
      </Container>
    </Box>
  ),
})
