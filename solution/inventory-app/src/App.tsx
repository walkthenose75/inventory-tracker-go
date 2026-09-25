import { useCallback, useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react'
import {
  makeStyles, tokens, shorthands,
  TabList, Tab, type SelectTabData, type SelectTabEvent,
  Button, Spinner, Badge, Text, Title3, Subtitle2, Caption1,
  Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TableCellLayout,
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions, DialogContent,
  Input, Field, Dropdown, Option, MessageBar, MessageBarBody, Card,
} from '@fluentui/react-components'
import {
  BoxRegular, AddRegular, EditRegular, DeleteRegular, ArrowClockwiseRegular,
  WarningRegular, TagRegular, ChatSparkleRegular, OpenRegular, CartRegular,
} from '@fluentui/react-icons'
import { Inv2_inventoryitemsService } from './generated/services/Inv2_inventoryitemsService'
import { Inv2_itemcategoriesService } from './generated/services/Inv2_itemcategoriesService'
import type { Inv2_inventoryitems, Inv2_inventoryitemsBase } from './generated/models/Inv2_inventoryitemsModel'
import type { Inv2_itemcategories } from './generated/models/Inv2_itemcategoriesModel'

const useStyles = makeStyles({
  app: { maxWidth: '1100px', ...shorthands.margin('0', 'auto'), ...shorthands.padding('24px') },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  brand: { display: 'flex', alignItems: 'center', ...shorthands.gap('12px') },
  logo: { fontSize: '28px', color: tokens.colorBrandForeground1, display: 'flex' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', ...shorthands.gap('12px'), marginBottom: '20px' },
  stat: { ...shorthands.padding('16px'), display: 'flex', flexDirection: 'column', ...shorthands.gap('4px') },
  statValue: { fontSize: '30px', fontWeight: tokens.fontWeightSemibold, lineHeight: '32px' },
  low: { color: tokens.colorPaletteRedForeground1 },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  actions: { display: 'flex', ...shorthands.gap('4px') },
  form: { display: 'flex', flexDirection: 'column', ...shorthands.gap('12px'), minWidth: '360px' },
  assistant: { ...shorthands.padding('20px'), display: 'flex', flexDirection: 'column', ...shorthands.gap('10px') },
  muted: { color: tokens.colorNeutralForeground3 },
  clickRow: { cursor: 'pointer' },
  thumb: { width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover', backgroundColor: tokens.colorNeutralBackground3 },
  thumbPlaceholder: {
    width: '36px', height: '36px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground3,
  },
  detailGrid: { display: 'grid', gridTemplateColumns: '160px 1fr', ...shorthands.gap('16px'), minWidth: '440px' },
  detailImage: { width: '160px', height: '160px', borderRadius: '8px', objectFit: 'cover', backgroundColor: tokens.colorNeutralBackground3 },
  detailImagePlaceholder: {
    width: '160px', height: '160px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground3, fontSize: '40px',
  },
  detailFields: { display: 'flex', flexDirection: 'column', ...shorthands.gap('8px') },
  detailRow: { display: 'flex', justifyContent: 'space-between', ...shorthands.gap('16px'), borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, paddingBottom: '6px' },
})

type Item = Inv2_inventoryitems
type Category = Inv2_itemcategories
const money = (n?: number) => (n == null ? '—' : `$${n.toFixed(2)}`)
const isLow = (i: Item) => (i.inv2_onhandcount ?? 0) <= (i.inv2_reorderthreshold ?? 0)
const reorderTarget = (i: Item) => ((i.inv2_reorderthreshold ?? 0) > 0 ? (i.inv2_reorderthreshold as number) * 3 : (i.inv2_onhandcount ?? 0) + 25)
const agentEmbedUrl = import.meta.env.VITE_AGENT_EMBED_URL as string | undefined

function App() {
  const styles = useStyles()
  const [tab, setTab] = useState('dashboard')
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [itemDialog, setItemDialog] = useState<{ open: boolean; edit?: Item }>({ open: false })
  const [catDialog, setCatDialog] = useState<{ open: boolean; edit?: Category }>({ open: false })
  const [detail, setDetail] = useState<Item | undefined>(undefined)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [it, ct] = await Promise.all([
        Inv2_inventoryitemsService.getAll({ orderBy: ['inv2_itemname asc'] }),
        Inv2_itemcategoriesService.getAll({ orderBy: ['inv2_categoryname asc'] }),
      ])
      if (!it.success) throw it.error ?? new Error('Could not load items')
      if (!ct.success) throw ct.error ?? new Error('Could not load categories')
      setItems(it.data ?? [])
      setCategories(ct.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const lowStock = useMemo(() => items.filter(isLow), [items])
  const totalValue = useMemo(
    () => items.reduce((s, i) => s + (i.inv2_costperitem ?? 0) * (i.inv2_onhandcount ?? 0), 0),
    [items],
  )

  const saveItem = async (payload: Record<string, unknown>, id?: string) => {
    setBusy(true)
    try {
      const res = id
        ? await Inv2_inventoryitemsService.update(id, payload as Partial<Omit<Inv2_inventoryitemsBase, 'inv2_inventoryitemid'>>)
        : await Inv2_inventoryitemsService.create(payload as unknown as Omit<Inv2_inventoryitemsBase, 'inv2_inventoryitemid'>)
      if (!res.success) throw res.error ?? new Error('Save failed')
      setItemDialog({ open: false }); await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const deleteItem = async (i: Item) => {
    setBusy(true)
    try { await Inv2_inventoryitemsService.delete(i.inv2_inventoryitemid); setDetail(undefined); await load() }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const reorder = async (i: Item) => {
    setBusy(true)
    try {
      const res = await Inv2_inventoryitemsService.update(i.inv2_inventoryitemid, { inv2_onhandcount: reorderTarget(i) })
      if (!res.success) throw res.error ?? new Error('Reorder failed')
      setDetail(undefined); await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const saveCategory = async (name: string, id?: string) => {
    setBusy(true)
    try {
      const res = id
        ? await Inv2_itemcategoriesService.update(id, { inv2_categoryname: name })
        : await Inv2_itemcategoriesService.create({ inv2_categoryname: name } as never)
      if (!res.success) throw res.error ?? new Error('Save failed')
      setCatDialog({ open: false }); await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const deleteCategory = async (c: Category) => {
    setBusy(true)
    try { await Inv2_itemcategoriesService.delete(c.inv2_itemcategoryid); await load() }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  const thumb = (i: Item) => (
    i.inv2_image_url
      ? <img className={styles.thumb} src={i.inv2_image_url} alt={i.inv2_itemname ?? ''} />
      : <span className={styles.thumbPlaceholder}><BoxRegular /></span>
  )

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}><BoxRegular /></span>
          <div>
            <Title3>Inventory Tracking v2</Title3>
            <div><Caption1 className={styles.muted}>Clinical supply console · Fluent UI 2</Caption1></div>
          </div>
        </div>
        <Button icon={<ArrowClockwiseRegular />} onClick={() => void load()} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </Button>
      </div>

      {error && <MessageBar intent="error" style={{ marginBottom: 12 }}><MessageBarBody>{error}</MessageBarBody></MessageBar>}

      <TabList selectedValue={tab} onTabSelect={(_: SelectTabEvent, d: SelectTabData) => setTab(d.value as string)}>
        <Tab value="dashboard">Dashboard</Tab>
        <Tab value="items">Items</Tab>
        <Tab value="categories">Categories</Tab>
        <Tab value="assistant">Assistant</Tab>
      </TabList>

      <div style={{ marginTop: 20 }}>
        {tab === 'dashboard' && (
          <>
            <div className={styles.stats}>
              <Card className={styles.stat}><Caption1 className={styles.muted}>Items</Caption1><span className={styles.statValue}>{items.length}</span></Card>
              <Card className={styles.stat}><Caption1 className={styles.muted}>Low stock</Caption1><span className={`${styles.statValue} ${lowStock.length ? styles.low : ''}`}>{lowStock.length}</span></Card>
              <Card className={styles.stat}><Caption1 className={styles.muted}>Inventory value</Caption1><span className={styles.statValue}>{money(totalValue)}</span></Card>
            </div>
            <Subtitle2>Needs reorder <WarningRegular style={{ verticalAlign: 'middle' }} /></Subtitle2>
            {lowStock.length === 0 && !loading ? (
              <Text className={styles.muted}> All items are above their reorder threshold.</Text>
            ) : (
              <Table aria-label="Low stock" style={{ marginTop: 8 }}>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Item</TableHeaderCell><TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>On hand</TableHeaderCell><TableHeaderCell>Reorder at</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((i) => (
                    <TableRow key={i.inv2_inventoryitemid} className={styles.clickRow} onClick={() => setDetail(i)}>
                      <TableCell><TableCellLayout media={thumb(i)}>{i.inv2_itemname}</TableCellLayout></TableCell>
                      <TableCell>{i.inv2_categoryidname ?? '—'}</TableCell>
                      <TableCell><Badge color="danger" appearance="tint">{i.inv2_onhandcount ?? 0}</Badge></TableCell>
                      <TableCell>{i.inv2_reorderthreshold ?? 0}</TableCell>
                      <TableCell>
                        <Button size="small" appearance="primary" icon={<CartRegular />}
                          onClick={(e: ReactMouseEvent) => { e.stopPropagation(); void reorder(i) }} disabled={busy}>Reorder</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}

        {tab === 'items' && (
          <>
            <div className={styles.toolbar}>
              <Subtitle2>Inventory items</Subtitle2>
              <Button appearance="primary" icon={<AddRegular />} onClick={() => setItemDialog({ open: true })}>New item</Button>
            </div>
            <Table aria-label="Items">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Item</TableHeaderCell><TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>Cost</TableHeaderCell><TableHeaderCell>On hand</TableHeaderCell>
                  <TableHeaderCell>Reorder at</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i) => (
                  <TableRow key={i.inv2_inventoryitemid} className={styles.clickRow} onClick={() => setDetail(i)}>
                    <TableCell><TableCellLayout media={thumb(i)}>{i.inv2_itemname}</TableCellLayout></TableCell>
                    <TableCell>{i.inv2_categoryidname ?? '—'}</TableCell>
                    <TableCell>{money(i.inv2_costperitem)}</TableCell>
                    <TableCell>{i.inv2_onhandcount ?? 0}</TableCell>
                    <TableCell>{i.inv2_reorderthreshold ?? 0}</TableCell>
                    <TableCell>{isLow(i) ? <Badge color="danger" appearance="tint">Low</Badge> : <Badge color="success" appearance="tint">OK</Badge>}</TableCell>
                    <TableCell onClick={(e: ReactMouseEvent) => e.stopPropagation()}>
                      <div className={styles.actions}>
                        <Button size="small" icon={<OpenRegular />} onClick={() => setDetail(i)} aria-label="Details" />
                        <Button size="small" icon={<EditRegular />} onClick={() => setItemDialog({ open: true, edit: i })} aria-label="Edit" />
                        <Button size="small" icon={<DeleteRegular />} onClick={() => void deleteItem(i)} aria-label="Delete" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {tab === 'categories' && (
          <>
            <div className={styles.toolbar}>
              <Subtitle2>Categories</Subtitle2>
              <Button appearance="primary" icon={<AddRegular />} onClick={() => setCatDialog({ open: true })}>New category</Button>
            </div>
            <Table aria-label="Categories">
              <TableHeader><TableRow><TableHeaderCell>Category</TableHeaderCell><TableHeaderCell>Items</TableHeaderCell><TableHeaderCell>Actions</TableHeaderCell></TableRow></TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.inv2_itemcategoryid}>
                    <TableCell><TableCellLayout media={<TagRegular />}>{c.inv2_categoryname}</TableCellLayout></TableCell>
                    <TableCell>{items.filter((i) => i._inv2_categoryid_value === c.inv2_itemcategoryid).length}</TableCell>
                    <TableCell>
                      <div className={styles.actions}>
                        <Button size="small" icon={<EditRegular />} onClick={() => setCatDialog({ open: true, edit: c })} aria-label="Edit" />
                        <Button size="small" icon={<DeleteRegular />} onClick={() => void deleteCategory(c)} aria-label="Delete" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {tab === 'assistant' && (
          <Card className={styles.assistant}>
            <Subtitle2><ChatSparkleRegular style={{ verticalAlign: 'middle' }} /> Inventory assistant</Subtitle2>
            {agentEmbedUrl ? (
              <iframe title="Inventory assistant" src={agentEmbedUrl} style={{ width: '100%', height: 520, border: 'none', borderRadius: 8 }} />
            ) : (
              <>
                <Text>A Copilot Studio agent using the <b>Dataverse MCP Server</b> answers inventory questions and flags low stock in natural language.</Text>
                <Text className={styles.muted}>Built as code and published. To light it up here, add the Dataverse MCP tool (one‑time consent), then set <code>VITE_AGENT_EMBED_URL</code> to the agent’s Custom website embed URL and redeploy. See <code>AGENT_BUILD.md</code>.</Text>
              </>
            )}
          </Card>
        )}
      </div>

      {detail && (
        <ItemDetail
          item={detail}
          busy={busy}
          onClose={() => setDetail(undefined)}
          onEdit={() => { const i = detail; setDetail(undefined); setItemDialog({ open: true, edit: i }) }}
          onReorder={() => void reorder(detail)}
          onDelete={() => void deleteItem(detail)}
        />
      )}
      {itemDialog.open && (
        <ItemDialog
          item={itemDialog.edit}
          categories={categories}
          busy={busy}
          onCancel={() => setItemDialog({ open: false })}
          onSave={saveItem}
        />
      )}
      {catDialog.open && (
        <CategoryDialog
          category={catDialog.edit}
          busy={busy}
          onCancel={() => setCatDialog({ open: false })}
          onSave={saveCategory}
        />
      )}
    </div>
  )
}

function ItemDetail(props: {
  item: Item; busy: boolean
  onClose: () => void; onEdit: () => void; onReorder: () => void; onDelete: () => void
}) {
  const styles = useStyles()
  const { item } = props
  const low = isLow(item)
  return (
    <Dialog open modalType="modal">
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{item.inv2_itemname}</DialogTitle>
          <DialogContent>
            <div className={styles.detailGrid}>
              {item.inv2_image_url
                ? <img className={styles.detailImage} src={item.inv2_image_url} alt={item.inv2_itemname ?? ''} />
                : <span className={styles.detailImagePlaceholder}><BoxRegular /></span>}
              <div className={styles.detailFields}>
                <div className={styles.detailRow}><Text className={styles.muted}>Category</Text><Text>{item.inv2_categoryidname ?? '—'}</Text></div>
                <div className={styles.detailRow}><Text className={styles.muted}>Cost per item</Text><Text>{money(item.inv2_costperitem)}</Text></div>
                <div className={styles.detailRow}><Text className={styles.muted}>On hand</Text><Text>{item.inv2_onhandcount ?? 0}</Text></div>
                <div className={styles.detailRow}><Text className={styles.muted}>Reorder threshold</Text><Text>{item.inv2_reorderthreshold ?? 0}</Text></div>
                <div className={styles.detailRow}><Text className={styles.muted}>Status</Text>{low ? <Badge color="danger" appearance="tint">Low — reorder</Badge> : <Badge color="success" appearance="tint">OK</Badge>}</div>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" icon={<DeleteRegular />} onClick={props.onDelete} disabled={props.busy}>Delete</Button>
            <Button appearance="secondary" icon={<EditRegular />} onClick={props.onEdit} disabled={props.busy}>Edit</Button>
            <Button appearance="primary" icon={<CartRegular />} onClick={props.onReorder} disabled={props.busy}>{props.busy ? <Spinner size="tiny" /> : 'Reorder'}</Button>
            <Button appearance="secondary" onClick={props.onClose} disabled={props.busy}>Close</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

function ItemDialog(props: {
  item?: Item; categories: Category[]; busy: boolean
  onCancel: () => void; onSave: (payload: Record<string, unknown>, id?: string) => void
}) {
  const styles = useStyles()
  const { item, categories } = props
  const [name, setName] = useState(item?.inv2_itemname ?? '')
  const [categoryId, setCategoryId] = useState(item?._inv2_categoryid_value ?? '')
  const [cost, setCost] = useState(String(item?.inv2_costperitem ?? ''))
  const [onHand, setOnHand] = useState(String(item?.inv2_onhandcount ?? ''))
  const [reorder, setReorder] = useState(String(item?.inv2_reorderthreshold ?? ''))
  const selectedCat = categories.find((c) => c.inv2_itemcategoryid === categoryId)

  const submit = () => {
    const payload: Record<string, unknown> = {
      inv2_itemname: name.trim(),
      inv2_costperitem: cost ? Number(cost) : null,
      inv2_onhandcount: onHand ? Number(onHand) : null,
      inv2_reorderthreshold: reorder ? Number(reorder) : null,
    }
    if (categoryId) payload['inv2_CategoryId@odata.bind'] = `/inv2_itemcategories(${categoryId})`
    props.onSave(payload, item?.inv2_inventoryitemid)
  }

  return (
    <Dialog open modalType="modal">
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{item ? 'Edit item' : 'New item'}</DialogTitle>
          <DialogContent>
            <div className={styles.form}>
              <Field label="Item name" required><Input value={name} onChange={(_, d) => setName(d.value)} /></Field>
              <Field label="Category">
                <Dropdown
                  placeholder="Select a category"
                  value={selectedCat?.inv2_categoryname ?? ''}
                  selectedOptions={categoryId ? [categoryId] : []}
                  onOptionSelect={(_, d) => setCategoryId(d.optionValue ?? '')}
                >
                  {categories.map((c) => (
                    <Option key={c.inv2_itemcategoryid} value={c.inv2_itemcategoryid}>{c.inv2_categoryname ?? ''}</Option>
                  ))}
                </Dropdown>
              </Field>
              <Field label="Cost per item"><Input type="number" value={cost} onChange={(_, d) => setCost(d.value)} contentBefore="$" /></Field>
              <Field label="On hand count"><Input type="number" value={onHand} onChange={(_, d) => setOnHand(d.value)} /></Field>
              <Field label="Reorder threshold"><Input type="number" value={reorder} onChange={(_, d) => setReorder(d.value)} /></Field>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={props.onCancel} disabled={props.busy}>Cancel</Button>
            <Button appearance="primary" onClick={submit} disabled={props.busy || !name.trim()}>
              {props.busy ? <Spinner size="tiny" /> : 'Save'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

function CategoryDialog(props: {
  category?: Category; busy: boolean
  onCancel: () => void; onSave: (name: string, id?: string) => void
}) {
  const styles = useStyles()
  const [name, setName] = useState(props.category?.inv2_categoryname ?? '')
  return (
    <Dialog open modalType="modal">
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{props.category ? 'Edit category' : 'New category'}</DialogTitle>
          <DialogContent>
            <div className={styles.form}>
              <Field label="Category name" required><Input value={name} onChange={(_, d) => setName(d.value)} /></Field>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={props.onCancel} disabled={props.busy}>Cancel</Button>
            <Button appearance="primary" onClick={() => props.onSave(name.trim(), props.category?.inv2_itemcategoryid)} disabled={props.busy || !name.trim()}>
              {props.busy ? <Spinner size="tiny" /> : 'Save'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export default App
