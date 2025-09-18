import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { logger } from 'npm:hono/logger'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Auth routes
app.post('/make-server-9d2931f1/auth/signup', async (c) => {
  try {
    const { email, password, name, role = 'operator', department = 'general' } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role, department },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log(`Signup error: ${error.message}`)
      return c.json({ error: error.message }, 400)
    }

    // Store additional user profile data
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      name,
      email,
      role,
      department,
      status: 'active',
      created_at: new Date().toISOString()
    })

    return c.json({ user: data.user, message: 'User created successfully' })
  } catch (error) {
    console.log(`Signup error: ${error}`)
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

// Work Orders routes
app.get('/make-server-9d2931f1/workorders', async (c) => {
  try {
    const workOrders = await kv.getByPrefix('workorder:')
    return c.json(workOrders.map(wo => wo.value))
  } catch (error) {
    console.log(`Get work orders error: ${error}`)
    return c.json({ error: 'Failed to fetch work orders' }, 500)
  }
})

app.post('/make-server-9d2931f1/workorders', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const workOrder = await c.req.json()
    const id = `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    
    const newWorkOrder = {
      id,
      ...workOrder,
      createdBy: user.id,
      createdDate: new Date().toISOString(),
      status: 'Open',
      progress: 0
    }

    await kv.set(`workorder:${id}`, newWorkOrder)
    
    return c.json(newWorkOrder)
  } catch (error) {
    console.log(`Create work order error: ${error}`)
    return c.json({ error: 'Failed to create work order' }, 500)
  }
})

app.put('/make-server-9d2931f1/workorders/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const id = c.req.param('id')
    const updates = await c.req.json()
    
    const existing = await kv.get(`workorder:${id}`)
    if (!existing) {
      return c.json({ error: 'Work order not found' }, 404)
    }

    const updatedWorkOrder = {
      ...existing,
      ...updates,
      lastModified: new Date().toISOString(),
      lastModifiedBy: user.id
    }

    await kv.set(`workorder:${id}`, updatedWorkOrder)
    
    return c.json(updatedWorkOrder)
  } catch (error) {
    console.log(`Update work order error: ${error}`)
    return c.json({ error: 'Failed to update work order' }, 500)
  }
})

// Assets routes
app.get('/make-server-9d2931f1/assets', async (c) => {
  try {
    const assets = await kv.getByPrefix('asset:')
    return c.json(assets.map(asset => asset.value))
  } catch (error) {
    console.log(`Get assets error: ${error}`)
    return c.json({ error: 'Failed to fetch assets' }, 500)
  }
})

app.post('/make-server-9d2931f1/assets', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const asset = await c.req.json()
    
    const newAsset = {
      ...asset,
      createdBy: user.id,
      createdDate: new Date().toISOString(),
      status: 'Active'
    }

    await kv.set(`asset:${asset.id}`, newAsset)
    
    return c.json(newAsset)
  } catch (error) {
    console.log(`Create asset error: ${error}`)
    return c.json({ error: 'Failed to create asset' }, 500)
  }
})

// Inventory routes
app.get('/make-server-9d2931f1/inventory', async (c) => {
  try {
    const items = await kv.getByPrefix('inventory:')
    return c.json(items.map(item => item.value))
  } catch (error) {
    console.log(`Get inventory error: ${error}`)
    return c.json({ error: 'Failed to fetch inventory' }, 500)
  }
})

app.post('/make-server-9d2931f1/inventory', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const item = await c.req.json()
    
    const newItem = {
      ...item,
      createdBy: user.id,
      createdDate: new Date().toISOString(),
      totalValue: item.currentStock * item.unitCost
    }

    await kv.set(`inventory:${item.id}`, newItem)
    
    return c.json(newItem)
  } catch (error) {
    console.log(`Create inventory item error: ${error}`)
    return c.json({ error: 'Failed to create inventory item' }, 500)
  }
})

// Tickets/Helpdesk routes
app.get('/make-server-9d2931f1/tickets', async (c) => {
  try {
    const tickets = await kv.getByPrefix('ticket:')
    return c.json(tickets.map(ticket => ticket.value))
  } catch (error) {
    console.log(`Get tickets error: ${error}`)
    return c.json({ error: 'Failed to fetch tickets' }, 500)
  }
})

app.post('/make-server-9d2931f1/tickets', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const ticket = await c.req.json()
    const id = `TKT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    
    const newTicket = {
      id,
      ...ticket,
      submittedBy: user.id,
      createdDate: new Date().toISOString(),
      status: 'Open',
      sla: getSLAHours(ticket.priority),
      comments: 0
    }

    await kv.set(`ticket:${id}`, newTicket)
    
    return c.json(newTicket)
  } catch (error) {
    console.log(`Create ticket error: ${error}`)
    return c.json({ error: 'Failed to create ticket' }, 500)
  }
})

// Calibration routes
app.get('/make-server-9d2931f1/calibrations', async (c) => {
  try {
    const calibrations = await kv.getByPrefix('calibration:')
    return c.json(calibrations.map(cal => cal.value))
  } catch (error) {
    console.log(`Get calibrations error: ${error}`)
    return c.json({ error: 'Failed to fetch calibrations' }, 500)
  }
})

app.post('/make-server-9d2931f1/calibrations', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const calibration = await c.req.json()
    const id = `CAL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    
    const newCalibration = {
      id,
      ...calibration,
      createdBy: user.id,
      createdDate: new Date().toISOString(),
      status: calculateCalibrationStatus(calibration.nextDue)
    }

    await kv.set(`calibration:${id}`, newCalibration)
    
    return c.json(newCalibration)
  } catch (error) {
    console.log(`Create calibration error: ${error}`)
    return c.json({ error: 'Failed to create calibration' }, 500)
  }
})

// Logbook routes
app.get('/make-server-9d2931f1/logbook', async (c) => {
  try {
    const entries = await kv.getByPrefix('logbook:')
    return c.json(entries.map(entry => entry.value).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ))
  } catch (error) {
    console.log(`Get logbook entries error: ${error}`)
    return c.json({ error: 'Failed to fetch logbook entries' }, 500)
  }
})

app.post('/make-server-9d2931f1/logbook', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const entry = await c.req.json()
    const id = `LOG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-6)}`
    
    const newEntry = {
      id,
      ...entry,
      operator: user.id,
      timestamp: new Date().toISOString(),
      attachments: 0
    }

    await kv.set(`logbook:${id}`, newEntry)
    
    return c.json(newEntry)
  } catch (error) {
    console.log(`Create logbook entry error: ${error}`)
    return c.json({ error: 'Failed to create logbook entry' }, 500)
  }
})

// Utility functions
function getSLAHours(priority: string): number {
  switch (priority?.toLowerCase()) {
    case 'critical': return 4
    case 'high': return 24
    case 'medium': return 72
    case 'low': return 168
    default: return 72
  }
}

function calculateCalibrationStatus(nextDue: string): string {
  const dueDate = new Date(nextDue)
  const today = new Date()
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilDue < 0) return 'Overdue'
  if (daysUntilDue <= 30) return 'Due Soon'
  return 'Current'
}

// Health check
app.get('/make-server-9d2931f1/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

export default {
  fetch: app.fetch,
}

Deno.serve(app.fetch)