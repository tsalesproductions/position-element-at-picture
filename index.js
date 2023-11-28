const area_elements = [];

class editor{
  image = "";
  elements = [];

  checkIfIsAValidImage(url){
    try{
      new URL(url);
      return true;
    }catch(e){
      return false;
    }
  }
  getURLImage(){
    $("#imagem").on('input', ({target}) => {
      const imgValid = this.checkIfIsAValidImage(target.value);
      if(!imgValid){
        Swal.fire({
          text: "Insira a url de uma imagem válida",
          icon: "error"
        });
        $(".editor .section.elements").hide();
      return;
      }
      
      const imageElement = $("#backgroundImage")
      if(imageElement.length > 0){
        imageElement.attr('src', target.value)
      }else{
        $("#container").prepend(`<img id="backgroundImage" src="${target.value}" alt="Background Image">`);
      }

      setTimeout(()=> {
        const imageWidth = $("#backgroundImage").width(),
            imageHeight = $("#backgroundImage").height();

        $("#container").attr('style', `width: ${imageWidth}px; height: ${imageHeight}px`);
      }, 500)

      $(".editor .section.elements").show();

      this.image = target.value;
    })
  }
  addElement(){
    const self = this;

    $("button[add-element]").click(() => {
      Swal.fire({
            title: 'Informe os detalhes do produto',
            html:
                '<label style="margin-bottom: 0; padding-bottom: 0;">Nome de identicação</label><input style="margin-top:0;" id="swal-input1" class="swal2-input" placeholder="Ex: Camisa X, Boné Y, ou o nome do produto">' +
                '<br><br><label style="margin-bottom: 0; padding-bottom: 0;">URL do produto</label><input style="margin-top:0;" id="swal-input2" class="swal2-input" placeholder="ex: https://seusite.com.br/produto-teste">',
            focusConfirm: false,
            confirmButtonText: "Adicionar",
            preConfirm: () => {
                const nomeProduto = document.getElementById('swal-input1').value;
                const urlProduto = document.getElementById('swal-input2').value;
                if(nomeProduto == "" || urlProduto == ""){
                  Swal.fire({
                    text: "Insira alguma nome de identificação e a url do produto",
                    icon: "error"
                  });
                  return;
                }
                
                if(!self.checkIfIsAValidImage(urlProduto)){
                  Swal.fire({
                    text: "A URL do produto não é válida. Verifique e insira novamente. Certifique-se que tenha https:// na frente. Ex: https://www.minhaloja.com.br/produto-teste",
                    icon: "error"
                  });
                  return;
                }

                return { nome: nomeProduto, url: urlProduto };
            }
        }).then((result) => {
            if (result.isConfirmed) {
              if(!result.value.nome && !result.value.url) return;
                
                console.log('Nome do Produto:', result.value.nome);
                console.log('URL do Produto:', result.value.url);

                self.saveElement({
                  name: result.value.nome,
                  url: result.value.url
                })
            }
        });
    })
  }
  saveElement({name, url}){
    const element = {
      id: this.elements.length+1,
      name: name,
      url: url,
    };

    this.elements.push(element);
    this.reloadListElements();
    this.addOptionToDrag(element);
  } 
  addOptionToDrag({id}){
    $("#container").append(`<div id="draggable${id}" data-id="${id}" class="draggable" draggable="true">${id}</div>`);

    this.checkDragabbleOptions();
  }
  reloadListElements(){
    $(".section .elements").empty();
    this.elements.forEach(({id, name, url}) => {
      $(".section .elements").append(`
      <div class="element" data-id="${id}">
            <div><strong>#${id}</strong> - ${name}</div>
            <div data-delete onClick="edt.deleteElement(${id})"><i class="fas fa-trash"></i></div>
          </div>
        `)
    })

    this.checkCanSave();
  }
  checkCanSave(){
    if(this.elements.length > 0){
      $(".editor .section.save").show();
    }else{
      $(".editor .section.save").hide();
      $(".editor .section.result").hide();
    }
  }
  deleteElement(id){
    this.elements.splice(parseInt(id)-1, 1);
    $(`#draggable${id}`).remove();
    this.reloadListElements();
  }
  checkDragabbleOptions(){
    const draggables = document.querySelectorAll('.draggable:not(.active)');
    console.log(draggables)
    draggables.forEach(draggable => {
        this.makeDraggable(draggable);
    });
  }
  makeDraggable(element) {
    let isDragging = false;
    let isFollowing = false;
    let offsetX, offsetY;
    let initialX, initialY;

    element.classList.add("active")

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        isFollowing = true;
        offsetX = (e.clientX / document.getElementById('container').offsetWidth) * 100;
        offsetY = (e.clientY / document.getElementById('container').offsetHeight) * 100;
        initialX = offsetX;
        initialY = offsetY;
        element.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const x = (e.clientX / document.getElementById('container').offsetWidth) * 100;
        const y = (e.clientY / document.getElementById('container').offsetHeight) * 100;

        if (isFollowing) {
            element.style.left = x + '%';
            element.style.top = y + '%';
        } else {
            const rect = element.getBoundingClientRect();
            const minX = 0;
            const minY = 0;
            const maxX = 100 - (rect.width / document.getElementById('container').offsetWidth) * 100;
            const maxY = 100 - (rect.height / document.getElementById('container').offsetHeight) * 100;

            element.style.left = Math.min(Math.max(x, minX), maxX) + '%';
            element.style.top = Math.min(Math.max(y, minY), maxY) + '%';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';

            if (isFollowing) {
                isFollowing = false;

                // Verificar se está fora dos limites e retornar à posição inicial
                const rect = element.getBoundingClientRect();
                const container = document.getElementById('container').getBoundingClientRect();

                if (
                    rect.left < container.left ||
                    rect.right > container.right ||
                    rect.top < container.top ||
                    rect.bottom > container.bottom
                ) {
                    element.style.left = initialX + '%';
                    element.style.top = initialY + '%';
                }
            }
        }
    });
  }
  saveButton(){
    let self = this;
    $("button[data-save]").click(() => {
      const positions = self.savePositions();
      $("textarea#result").val(JSON.stringify({
        image: self.image,
        positions: positions
      }))
      if(positions.length > 0){
        $(".editor .section.result").show()
      }else{
        $(".editor .section.result").hide();
      }
    })
  }
  savePositions() {
      const elements = document.querySelectorAll('.draggable.active');
      const positions = [];

      elements.forEach(element => {
          positions.push({
              id: parseInt(element.getAttribute('data-id')),
              _id: element.id,
              left: element.style.left,
              top: element.style.top,
              data: this.elements[parseInt(element.getAttribute('data-id'))-1]
          });
      });

      return positions;
  }
  init(){
    this.getURLImage();
    this.addElement();
    this.saveButton();
  }
}

const edt = new editor();

window.addEventListener("load", () => edt.init())




































const editor_area = {
  sections: [
    {
      id: "img",
      title: "Imagem",
      description: "",
      fields: [
        {
          name: "",
          type: "",
          value: "",
          placeholder: "",
        }
      ]
    }
  ]
}
