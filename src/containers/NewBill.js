import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
    this.formData = new FormData()
  }

  handleChangeFile = e => {
    e.preventDefault()
    const input =  this.document.querySelector(`input[data-testid="file"]`)
    const file = input.files[0]

    // check file type
    const validMimetypes = ['image/jpg', 'image/jpeg', "image/png"]
    const fileTypeError = "Seul les fichiers png, jpg et jpg sont acceptés"
    if(!validMimetypes.includes(file.type)){
      alert(fileTypeError)
      console.log(fileTypeError)
      input.value = ""
      input.files = []
      return
    }

    this.formData.append('file', file)
  }

  handleSubmit = e => {
    e.preventDefault()
    const t = e.target

    this.formData.append('email', JSON.parse(localStorage.getItem("user")).email)
    this.formData.append('type', t.querySelector(`select[data-testid="expense-type"]`).value,)
    this.formData.append('name', t.querySelector(`input[data-testid="expense-name"]`).value)
    this.formData.append('amount', t.querySelector(`input[data-testid="amount"]`).value)
    this.formData.append('date', t.querySelector(`input[data-testid="datepicker"]`).value)
    this.formData.append('vat', t.querySelector(`input[data-testid="vat"]`).value)
    this.formData.append('pct', t.querySelector(`input[data-testid="pct"]`).value)
    this.formData.append('commentary', t.querySelector(`textarea[data-testid="commentary"]`).value)
    this.formData.append('status', 'pending')

    this.store.bills().create({
          data: this.formData,
          headers: {
            noContentType: true
          }
        })
        .then(({key}) => {
          this.billId = key
          this.onNavigate(ROUTES_PATH['Bills'])
        }).catch(error => console.error(error))
  }

  // not need to cover this function by tests
  /*updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }*/
}