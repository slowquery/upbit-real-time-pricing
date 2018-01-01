import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import _ from 'lodash';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  coinForm: FormGroup;
  coin_name: any;
  coin_data : any;
  coin_interval: any;
  api_coin = [];
  view_type = "KRW";

  constructor(private http: HttpClient, private fb: FormBuilder) { 
  	this.createForm();
  }

  ngOnInit() {
  	this.http.get("https://s3.ap-northeast-2.amazonaws.com/crix-production/crix_master").subscribe(data => {
  		this.coin_name = data;
  	});

  	this.coin_interval = setInterval(() => this.getCoin(), 1500);
  }
  getCoin() {
  	if(this.api_coin.length) {
  		this.http.get(`https://crix-api-endpoint.upbit.com/v1/crix/recent?codes=${this.api_coin.map((data) => { return `CRIX.UPBIT.${this.view_type}-` + data.toUpperCase(); }).toString()}`).subscribe(data => {
	  		this.coin_data = data;
	  	});
  	}
  	else {
  		this.coin_data = null;
  	}
  }
  createForm() {
  	this.coinForm = this.fb.group({
  		coin: ['', Validators.required ]
  	});
  }
  onAdd() {
  	if(!this.searchCoin(this.coinForm["value"]["coin"])) {
  		alert("존재하지 않는 코인입니다.");
  		return;
  	}
  	else if(this.api_coin.indexOf(this.coinForm["value"]["coin"].toLowerCase()) !== -1 || this.api_coin.indexOf(this.coinForm["value"]["coin"].toUpperCase()) !== -1) {
  		_.remove(this.api_coin, (data) => {
	  		return data === this.coinForm["value"]["coin"];
	  	});
  	}
  	else if(this.api_coin.length === 5) {
  		alert("모니터링 가능한 코인은 최대 5개입니다.");
  		return;
  	}
  	else if(this.view_type === "BTC" && (this.coinForm["value"]["coin"] === "BTC" || this.coinForm["value"]["coin"] === "btc")) {
  		alert("기준이 되는 코인은 모니터링 할 수 없습니다.");
  		return;
  	}
  	else {
  		this.api_coin.push(this.coinForm["value"]["coin"]);	
  	}
  	
  	this.getCoin();
  }
  krw_convert(krw) {
  	return new Intl.NumberFormat("ko-kr", { currency: "KRW" }).format(krw) + "원";
  }
  getRealName(coin) {
  	return this.coin_name ? this.coin_name[_.findIndex(this.coin_name, {code: coin})]["koreanName"] : false;
  }
  searchCoin(coin) {
  	return _.findIndex(this.coin_name, {code: `CRIX.UPBIT.KRW-${coin.toUpperCase()}`}) !== -1 ? true : false;
  }
  viewTypeToggle() {
  	_.remove(this.api_coin, (data) => {
  		return data === "BTC" || data === "btc";
  	});
  	this.view_type = this.view_type === "KRW" ? "BTC" : "KRW";
  	this.getCoin();
  }
  viewType() {
  	return this.view_type === "KRW" ? "₩" : "Ƀ";
  }
}
