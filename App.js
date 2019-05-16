import * as React from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import { Constants } from 'expo';
import { DOMParser } from 'xmldom';

// You can import from local files
import AssetExample from './components/AssetExample';

// or any pure javascript modules available in npm
import { Card } from 'react-native-paper';

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {busData:{}}
  }

  reloadData = () => {
    const url =
      'http://www.horariosdofunchal.pt/index.php?option=com_simip&task=consultaParagem&id=';
    fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        Referer:
          'http://www.horariosdofunchal.pt/index.php?option=com_simip&task=consultaParagem&id=',
        'If-Modified-Since': 'Sat, 1 Jan 2000 00:00:00 GMT',
        'content-type': 'application/x-www-form-urlencoded',
        DNT: '1',
        Connection: 'keep-alive',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
      },
      body: "xjxfun=fazPedido&xjxargs[]=<xjxobj><e><k>carreirasurb</k><v>13</v></e><e><k>carreirasinter</k><v>0</v></e><e><k>sentidos</k><v>17862</v></e><e><k>paragens</k><v>80</v></e><e><k>pesquisa</k><v>Pesquisar</v></e></xjxobj>",
    })
      .then(data => data.text())
      .then(data => {
        var xmlData = new DOMParser().parseFromString(data)
        var textPayload = xmlData.childNodes[1].childNodes[1].childNodes[0].nodeValue
        var htmlData = new DOMParser().parseFromString(textPayload)

        var container = htmlData.getElementById('infoParagens')
        var title = htmlData.getElementById('nomeparagem').textContent
        var rows = Array.from(htmlData.getElementsByTagName('tr')).slice(1)
        var busData = {}
        for (var row = 0; row < rows.length; row++) {
          var tds = rows[row].getElementsByTagName('td')
          if (busData[tds[0].textContent] === undefined) {
            busData[tds[0].textContent] = []
          }
          busData[tds[0].textContent].push(tds[1].textContent)
        }
        
        console.log(busData)
        this.setState({ title: title, busData: busData });
      })
      .catch(error => {
        console.error(error);
      });
  };

  busNames = {
    9: "Courelas",
    13: "Jamboto",
    12: "Jamboto",
    48: "Nazaré / Monte"
  }

  getBusName = (bus) => {
    return this.busNames[bus] || bus
  }

  renderBusData = () => {
    return Object.keys(this.state.busData).map(bus => {
      return (
        <View>
          <View style={styles.busLabel}><Text style={styles.bus}>{bus} {this.getBusName(bus)}: </Text></View>
          <Text style={styles.minutos}>{this.state.busData[bus].join(', ')} min.</Text>
        </View> 
      )
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>
          Horarios do Funchal
        </Text>
        <Text style={styles.paragraph}>
          Tempos de espera
        </Text>
        <Card>
          <Text>{this.state.title}</Text>
        </Card>
        <Card>
          { this.renderBusData() }
        </Card>
        <Button title="Recarregar" onPress={this.reloadData}>
          <Text>Recarregar</Text>
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    marginBottom: 24,
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bus: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  busLabel: {
    backgroundColor: '#444',
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 5,
    margin: 10,
  },
  minutos: {
    margin: 10,
    marginTop: 0,
    fontSize: 22,
  }
});
