import Component from '../../../src/EntityComponent/Component'

export default class Physical extends Component {
    constructor(weight: number) {
        super();
        this.data['weight'] = weight;
    }
}
