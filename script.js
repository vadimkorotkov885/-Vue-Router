const sharedState = {
	history: [],
}
const Calculator = {
	template: `
        <v-container class="fill-height" fluid>
          <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="6">
              <div class="nav-buttons">
                <v-btn to="/" color="primary">Калькулятор</v-btn>
                <v-btn to="/history" color="secondary">История</v-btn>
              </div>
              <v-card class="calculator">
                <v-card-text class="expression">{{ expression }}</v-card-text>
                <v-card-text class="display">{{ displayValue || '0' }}</v-card-text>
                <v-card-actions>
                  <v-row>
                    <v-col cols="12">
                      <v-row>
                        <v-col cols="3" v-for="n in [7,8,9,'/']" :key="n">
                          <v-btn block @click="append(n)" :class="{ 'operation-btn': ['/','*','-','+'].includes(n) }">
                            {{ n }}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="3" v-for="n in [4,5,6,'*']" :key="n">
                          <v-btn block @click="append(n)" :class="{ 'operation-btn': ['/','*','-','+'].includes(n) }">
                            {{ n }}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="3" v-for="n in [1,2,3,'-']" :key="n">
                          <v-btn block @click="append(n)" :class="{ 'operation-btn': ['/','*','-','+'].includes(n) }">
                            {{ n }}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="3">
                          <v-btn block @click="clear" class="clear-btn">C</v-btn>
                        </v-col>
                        <v-col cols="3">
                          <v-btn block @click="append(0)">0</v-btn>
                        </v-col>
                        <v-col cols="3">
                          <v-btn block @click="append('.')">.</v-btn>
                        </v-col>
                        <v-col cols="3">
                          <v-btn block @click="append('+')" class="operation-btn">+</v-btn>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-btn block @click="calculate" class="equals-btn" large>=</v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      `,
	data() {
		return {
			displayValue: '',
			previousValue: null,
			operation: null,
			waitingForOperand: false,
			expression: '',
			lastOperation: null,
		}
	},
	methods: {
		append(number) {
			if (['+', '-', '*', '/'].includes(number)) {
				if (this.displayValue === '' && number === '-') {
					this.displayValue = '-'
					return
				}

				if (this.displayValue === '' || this.displayValue === '-') return

				if (this.operation && !this.waitingForOperand) {
					this.calculate()
				}

				this.expression = this.displayValue + ' ' + number
				this.previousValue = parseFloat(this.displayValue)
				this.operation = number
				this.waitingForOperand = true
				this.lastOperation = number
			} else {
				if (this.waitingForOperand) {
					this.displayValue = String(number)
					this.waitingForOperand = false
					this.expression += ' ' + this.displayValue
				} else {
					this.displayValue =
						this.displayValue === '0'
							? String(number)
							: this.displayValue + number
					if (this.operation) {
						this.expression =
							this.previousValue +
							' ' +
							this.operation +
							' ' +
							this.displayValue
					}
				}
			}
		},
		clear() {
			this.displayValue = ''
			this.previousValue = null
			this.operation = null
			this.waitingForOperand = false
			this.expression = ''
			this.lastOperation = null
		},
		calculate() {
			if (this.operation && !this.waitingForOperand) {
				const currentValue = parseFloat(this.displayValue)
				let result

				switch (this.operation) {
					case '+':
						result = this.previousValue + currentValue
						break
					case '-':
						result = this.previousValue - currentValue
						break
					case '*':
						result = this.previousValue * currentValue
						break
					case '/':
						result = this.previousValue / currentValue
						break
					default:
						return
				}

				const historyItem = {
					expression:
						this.previousValue + ' ' + this.operation + ' ' + currentValue,
					result: result,
					timestamp: new Date().toLocaleString(),
				}
				sharedState.history.unshift(historyItem)
				if (sharedState.history.length > 10) {
					sharedState.history.pop()
				}

				this.expression =
					this.previousValue + ' ' + this.operation + ' ' + currentValue + ' ='
				this.displayValue = String(result)
				this.previousValue = result
				this.operation = null
				this.waitingForOperand = true
			}
		},
	},
}
const History = {
	template: `
        <v-container>
          <div class="nav-buttons">
            <v-btn to="/" color="primary">Калькулятор</v-btn>
            <v-btn to="/history" color="secondary">История</v-btn>
          </div>
          <v-card>
            <v-card-title>История вычислений</v-card-title>
            <v-card-text>
              <v-list v-if="sharedState.history.length">
                <v-list-item v-for="(item, index) in sharedState.history" :key="index" class="history-item">
                  <v-list-item-content>
                    <v-list-item-title>{{ item.expression }} = {{ item.result }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.timestamp }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info">История вычислений пуста</v-alert>
            </v-card-text>
          </v-card>
        </v-container>
      `,
	data() {
		return {
			sharedState: sharedState,
		}
	},
}
const router = new VueRouter({
	routes: [
		{ path: '/', component: Calculator },
		{ path: '/history', component: History },
	],
})
new Vue({
	el: '#app',
	vuetify: new Vuetify(),
	router,
	data: {
		sharedState: sharedState,
	},
})
