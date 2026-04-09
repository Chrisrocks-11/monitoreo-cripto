import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  isDarkMode: boolean = true;
  searchTerm: string = '';
  cryptos: any[] = [];
  backgroundLogos: any[] = [];

  // Lista de monedas para consulta (CoinGecko API)
  private coinIds = 'bitcoin,ethereum,solana,binancecoin,cardano,dogecoin,ripple';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.getData(true);
    this.startRain();
    // Actualización automática cada 45 segundos
    setInterval(() => this.getData(false), 45000);
  }

  /**
   * REPRODUCIR SONIDOS DEL SISTEMA
   */
  playSfx(type: 'switch' | 'alert') {
    const audio = new Audio(`assets/sounds/${type === 'switch' ? 'switch.mp3' : 'price-alert.mp3'}`);
    audio.volume = 0.2;
    audio.play().catch(() => { /* Bloqueado hasta interacción */ });
  }

  /**
   * OBTENER DATOS DE MERCADO
   */
  getData(first: boolean) {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${this.coinIds}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;

    this.http.get<any[]>(url).subscribe(data => {
      this.cryptos = data.map(coin => ({
        image: coin.image,
        name: coin.name,
        symbol: coin.symbol,
        price: coin.current_price,
        change: (coin.price_change_percentage_24h >= 0 ? '+' : '') + coin.price_change_percentage_24h.toFixed(2) + '%',
        history: coin.sparkline_in_7d.price,
        apiId: coin.id
      }));
      this.cdr.detectChanges();
    });
  }

  /**
   * CREAR LÍNEA DE TENDENCIA SVG
   */
  generateSparkline(h: number[]): string {
    if (!h) return '0,0';
    const min = Math.min(...h), max = Math.max(...h), r = max - min || 1;
    return h.map((v, i) => `${(i / (h.length - 1)) * 100},${30 - ((v - min) / r) * 30}`).join(' ');
  }

  /**
   * CAMBIAR TEMA VISUAL
   */
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.playSfx('switch');
  }

  /**
   * FILTRO DE BÚSQUEDA
   */
  get filteredCryptos() {
    return this.cryptos.filter(c =>
      c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.symbol.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  /**
   * INICIAR LLUVIA DE ACTIVOS
   */
  startRain() {
    setInterval(() => {
      if (this.cryptos.length === 0) return;
      const c = this.cryptos[Math.floor(Math.random() * this.cryptos.length)];
      this.backgroundLogos.push({
        image: c.image,
        left: Math.random() * 100,
        duration: 15,
        size: 40,
        opacity: this.isDarkMode ? 0.2 : 0.1
      });
      if (this.backgroundLogos.length > 15) this.backgroundLogos.shift();
      this.cdr.detectChanges();
    }, 2000);
  }
}