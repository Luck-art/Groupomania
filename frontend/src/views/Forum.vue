<template>
    <div>
        <FlashMessage :position="'right bottom'"></FlashMessage>
        <section>
        <div class="chip">
            <h2>Bienvenue {{ username }}  !</h2>
        </div> 
        </section>
        <main>
        <h3>Voici les derniers messages:</h3>
        <!--<div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">-->
            <div class="card text-center main_container">
                
                <div class="card-body bg-light container_card"  v-for="(message) in messages" :key="message.id">
                    <div class="card-header">
                    {{ username }}
                    </div>
                    <h3 class="card-title">{{ message.title }}</h3>
                    <div class="card-text">{{ message.content }}</div>
                    <p>{{ message.UserId }}</p>
                    <p>{{ message.likes }}</p>
                    <p class="card-footer text-muted">{{ formatDate(message.createdAt) }}</p>
                </div>
            </div>

            



            <!--<nav aria-label="..." id="pagination">
                <ul class="pagination">
                    <div v-for="(i) in maxPages" :key="i">
                        <li class="page-item disabled">
                            <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
                        </li>
                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                        <li class="page-item" aria-current="page">
                            <a class="page-link" href="#">2</a>
                        </li>
                        <li class="page-item"><a class="page-link" href="#">3</a></li>
                        <li class="page-item">
                            <a class="page-link" href="#">Next</a>
                        </li>
                    </div>
                </ul>
            </nav>-->
        <!--</div>-->
        </main>
        
       
        <aside>
        <form class="row g-3 the_form">
            <h2>Exprimez vous!</h2>
            <div class="input-group mb-3">
                <span class="input-group-text" id="inputGroup-sizing-default">Titre</span>
                <input type="text" class="form-control" v-model="title" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default">
            </div>
            <div class="mb-3">
                <label for="exampleFormControlTextarea1" class="form-label">Example textarea</label>
                <textarea class="form-control" id="exampleFormControlTextarea1" v-model="content" rows="3"></textarea>
            </div>
            <div class="col-12">
                <button class="btn btn-primary" type="button" @click="submitMessage">Submit</button>
            </div>
        </form>
        </aside>
    </div>
</template>


<script>
import { axios } from '@/plugins/axios'

export default {
    data: function() {
        return {
            username:  this.$store.state.username,
            title: "",
            content: "",
            messages: "",
            limit: 10, // perPage
            offset: 0,
            total: 0 // totalPages
        }
    },
    async created() {
        const data = (await axios.get(
            'http://localhost:8081/api/messages/?offset=' + this.offset + '&limit=' + this.limit,
            {
                headers: {"Authorization" : `Bearer ${this.$store.state.token}`}
            }
        )).data;
    this.messages = data.rows;
    this.total = data.count;
    console.log(this.total);
    },
    methods: {
        submitMessage: function() {
            console.log(this.$store.state.token);
                axios.post('http://localhost:8081/api/messages/', {
                    content: this.content,
                    title: this.title,
                },
                    {
                    headers: {
                            "Authorization" : `Bearer ${this.$store.state.token}`
                            },
                    })
                .then(response => {
                    this.flashMessage.success({title: 'Succes !', message: 'Votre message a bien été enregistré !'});
                    console.log(response);
                })
                .catch(error => {
                    error.response
                    this.flashMessage.error({title: 'Erreur !', message: 'Une erreur est survenue !'});
                });
        },
        formatDate: function(date) {
            const formatedDate = new Date(date);
            return formatedDate.toLocaleDateString();
        }   
    }
}
</script>

<style scoped>
    section {
        background-color: rgba(245, 245, 245, 0.822);
    }
    main {
        text-align: center;
        background-color: white;
    }
    aside {
        display: flex;
        justify-content: center;
        background-color: whitesmoke;
        padding: 1.5%;
    }
    .main_container {
        display: flex;
        align-items: center;
        background-color: whitesmoke;
    }
    .container_card {
        margin: 1%;
        max-width: 100%;
        min-width: 75%;
        width: auto;
        box-shadow: 0px 0px , -0.4em 0 .4em rgb(155, 155, 151);
    }
    .the_form {
        max-width: 90%;
        min-width: 75%;     
        background-color: rgb(131, 131, 206);
        padding: 0.5%;  
    }
    /*.pagination {
        justify-content: center;
    }*/
</style>
