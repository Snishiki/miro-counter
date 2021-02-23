async function showStatistics(selection) {
  clear()
  const statByType = calcByType(selection)
  const statTime = await calcTime(selection)
  getContainer().appendChild(createStatTable('Type', 'Looks like the selection is empty.', statByType, statTime))
}

function clear() {
  const elements = getContainer().getElementsByClassName('stat-list__table')
  for (let i = 0; i < elements.length; i++) {
    elements.item(i).remove()
  }
}

function getContainer() {
  return document.getElementById('stat-container')
}

function createStatTable(title, emptyText, data, timeData) {
  console.log('start createStat');
  
  const statView = document.createElement('div')
  statView.className = 'stat-list__table'

  const timeTitleView = document.createElement('div')
  timeTitleView.className = 'stat-list__title'
  timeTitleView.innerHTML = `<span>Time</span>`
  statView.appendChild(timeTitleView)

  if (data.size === 0) {
    const emptyView = document.createElement('div')
    emptyView.className = 'stat-list__empty'
    emptyView.innerText = emptyText
    statView.appendChild(emptyView)
  } else {
    Object.keys(timeData).forEach(function (key) {
      let itemView = document.createElement('div')
      itemView.className = 'stat-list__item'
      itemView.innerHTML = 
        `<span class="stat-list__item-name">${key}</span>` +
        `<span class="stat-list__item-value">${timeData[key]}</span>` 
      statView.appendChild(itemView)
    })
  }

  const titleView = document.createElement('div')
  titleView.className = 'stat-list__title'
  titleView.innerHTML = `<span>${title}</span>`
  statView.appendChild(titleView)

  if (data.size === 0) {
    const emptyView = document.createElement('div')
    emptyView.className = 'stat-list__empty'
    emptyView.innerText = emptyText
    statView.appendChild(emptyView)
  } else {
    data.forEach((value, key) => {
      let itemView = document.createElement('div')
      itemView.className = 'stat-list__item'
      itemView.innerHTML =
        `<span class="stat-list__item-name">${key.toLowerCase()}</span>` +
        `<span class="stat-list__item-value">${value}</span>`
      statView.appendChild(itemView)
    })
  }

  return statView
}

function calcByType(widgets) {
  return countBy(widgets, (a) => a.type)
}

function countBy(list, keyGetter) {
  const map = new Map()
  list.forEach((item) => {
    const key = keyGetter(item)
    const count = map.get(key)
    map.set(key, !count ? 1 : count + 1)
  })
  return new Map([...map.entries()].sort((a, b) => b[1] - a[1]))
}

async function calcTime(widgets) {
  console.log('start calcTime')
  let estimationSum = 0
  let resultSum = 0
  await Promise.all(widgets.map(async widget => {
    if (widget.type !== "SHAPE") {
      return
    }
    const shape = (await miro.board.widgets.get({id: widget.id}))[0]
    if (shape.plainText.slice(0,1) === 'e'){
      estimationSum += Number(shape.plainText.replace(/[^0-9^\.]/g,""))
    } else {
      resultSum += Number(shape.plainText.replace(/[^0-9^\.]/g,""))
    }
  }))
  const sumTime = {
    '見積もり': estimationSum,
    '実績': resultSum,
  }
  console.log(sumTime)
  return sumTime
}

miro.onReady(() => {
  miro.addListener('SELECTION_UPDATED', (e) => {
    showStatistics(e.data)
  })
  miro.board.selection.get().then(showStatistics)
})
