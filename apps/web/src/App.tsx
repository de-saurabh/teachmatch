import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, Flex, Typography } from 'antd'
import { useState } from 'react'

const { Title, Paragraph } = Typography

function App() {
  const [count, setCount] = useState(0)

  return (
    <Flex vertical align="center" justify="center" gap="middle" style={{ minHeight: '100vh' }}>
      <CheckCircleOutlined style={{ fontSize: 40, color: '#3B6E55' }} />
      <Title level={2} style={{ margin: 0 }}>
        TeachMatch
      </Title>
      <Paragraph type="secondary">Edit src/App.tsx and save to test HMR</Paragraph>
      <Button type="primary" onClick={() => setCount((count) => count + 1)}>
        Count is {count}
      </Button>
    </Flex>
  )
}

export default App
