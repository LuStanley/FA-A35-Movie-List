(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []
  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')
  const pagination = document.getElementById('pagination')
  const switchItems = document.getElementById('switch-items')
  const listDisplay = document.getElementById('list-display')
  const pictureDisplay = document.getElementById('picture-display')
  const genresList = document.getElementById('genre-list')
  const ITEM_PER_PAGE = 12
  const genreData = {
    "1": "Action",
    "2": "Adventure",
    "3": "Animation",
    "4": "Comedy",
    "5": "Crime",
    "6": "Documentary",
    "7": "Drama",
    "8": "Family",
    "9": "Fantasy",
    "10": "History",
    "11": "Horror",
    "12": "Music",
    "13": "Mystery",
    "14": "Romance",
    "15": "Science Fiction",
    "16": "TV Movie",
    "17": "Thriller",
    "18": "War",
    "19": "Western"
  }


  let paginationData = []
  let currentPage = 1
  let value = null
  // One Page Data
  function getPageData(pageNum, data) {
    currentPage = pageNum
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    if (switchItems.classList.contains('list-mode')) {
      listFormat(pageData)
    } else if (switchItems.classList.contains('picture-mode')) {
      pictureFormat(pageData)
    }
  }

  // genres list 
  function genreList(genreData, value) {
    let listContent = `<li class="list-group-item list-group-item-dark gener-title">Movies Genre</li>`
    Object.keys(genreData).forEach(function (item) {
      if (value === genreData[item]) {
        listContent += `
        <li class="list-group-item active" data-id="${item}">${genreData[item]}</li>
      `
      } else {
        listContent += `
        <li class="list-group-item" data-id="${item}">${genreData[item]}</li>
      `
      }
    })
    genresList.innerHTML = listContent
  }

  // pagination
  function getTotalPages(data, currentPage) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      if (Number(currentPage) === (i + 1)) {
        pageItemContent += `
          <li class="page-item active">
        
        `
      } else {
        pageItemContent += `
          <li class="page-item">
        `

      }
      pageItemContent += `
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  // Favorite Item
  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  //List Display
  function listFormat(data) {
    let htmlContent = ''
    data.forEach(function (item) {
      htmlContent += `
        <table class="table">
          <tbody>
            <tr>
              <td>${item.title}</td>
              <td class="listButton">               
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>               
              </td>
            </tr>
          </tbody>
        </table>
      `
    })

    dataPanel.innerHTML = htmlContent
  }

  //Picture Display
  function pictureFormat(data) {
    let htmlContent = ''
    data.forEach(function (item) {
      htmlContent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${item.title}</h5>
            </div>

            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
    })

    dataPanel.innerHTML = htmlContent
  }

  //Show Movie on Modal
  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  // request API
  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    getTotalPages(data, currentPage)
    getPageData(1, data)
    genreList(genreData, value)

  }).catch((err) => console.log(err))

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to search form submit event
  searchForm.addEventListener('submit', event => {
    let results = []
    event.preventDefault()
    const regex = new RegExp(searchInput.value, 'i')
    results = data.filter(movie => movie.title.match(regex))
    getTotalPages(results)
    getPageData(1, results)
  })

  // listen to pagination
  pagination.addEventListener('click', event => {
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
      getTotalPages(data, event.target.dataset.page)
    }
  })

  //Switch Display mode
  switchItems.addEventListener('click', event => {
    if (event.target.id === listDisplay.id) {
      switchItems.classList.add('list-mode')
      switchItems.classList.remove('picture-mode')
      getPageData(currentPage)
    } else if (event.target.id === pictureDisplay.id) {
      switchItems.classList.add('picture-mode')
      switchItems.classList.remove('list-mode')
      getPageData(currentPage)
    }
  })

  genresList.addEventListener('click', event => {
    let results = []
    event.preventDefault()
    results = data.filter(movie => movie.genres.includes(+event.target.dataset.id))
    getTotalPages(results)
    getPageData(1, results)
    genreList(genreData, event.target.innerHTML)
  })

})()