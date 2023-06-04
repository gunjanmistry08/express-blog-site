document.addEventListener('DOMContentLoaded',function () {
    const allButton = document.querySelectorAll('.searchBtn')
    const searchBar = document.querySelector('.searchBar')
    const searchInput = document.getElementById('searchinput')
    const searchClose = document.getElementById('searchClose')

    for (let index = 0; index < allButton.length; index++) {
        allButton[index].addEventListener('click', function () {
            searchBar.style.visibility = 'visible'
            searchBar.classList.add('open')
            searchBar.setAttribute('aria-expanded','true')
            searchInput.focus()
        })

        searchClose.addEventListener('click',() =>{
            searchBar.style.visibility = 'hidden'
            searchBar.classList.remove('open')
            this.setAttribute('aria-expanded','false')
        })
        
    }
})