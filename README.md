# c2b2: a Cloud-native Chaos Benchmarking suite for the Hyperledger Fabric Blockchain

**_c2b2_** leverages  [HyperLedger Bevel](https://blockchain-automation-framework.readthedocs.io/en/latest/index.html) (previously Blockchain Automation Framework), [Hyperledger Caliper](https://hyperledger.github.io/caliper/) and [ChaosMesh](https://github.com/chaos-mesh/chaos-mesh) to simplify and automate deployment and benchmarks of distributed [Hyperledger Fabric](https://www.hyperledger.org/use/fabric) blockchain installations on Kubernetes.

## Abstract

We present the design and evaluation of **_c2b2_**, an integrated suite for chaos engineering and benchmarking of large-scale, multi-cloud Hyperledger Fabric installations. **_c2b2_** is cloud-native and adopts an _everything-as-code_ approach, facilitating the reproducibility of experiments by streamlining their deployment on Kubernetes while offering simplified and flexible configuration to developers.
**_c2b2_** enables large-scale testing of complex multi-cloud deployment scenarios through network emulation, and its chaos engineering features allow simultaneously evaluating the impact of faults or network instabilities. Our evaluation of **_c2b2_** demonstrates its interest in terms of the reduction of the experiment setup complexity for two representative scenarios, the evaluation of the impact of a consortium organic growth and the evaluation of the impact of geo-distribution on performance.

## Repository architecture

The repository is composed of the following directories:
- [appSimpleAunction/](./appSimpleAunction): example blockchain application
- [caliper/](./caliper): Caliper Helm chart
- [minioChart/](./minioChart): Minio used for experimentations
- [ourAutomation/](./ourAutomation): configuration file generator

## Installation

### Prerequisites

Install [Hyperledger Bevel reprequisites](https://blockchain-automation-framework.readthedocs.io/en/latest/prerequisites.html) (namely, Git, Kubernetes, a HashiCorp Vault client, Ansible, NPM, and Docker).

### Set a test configuration

In order to use **_c2b2_** you have to parameter three configurations files:

- the deployment configuration file
- the injector configuration file
- the chaos engineering configuration file

### Deployment configuration

This file specifies how to configure the deployment of Fabric on the Kubernetes cluster. It is used to generate Bevel configuration files before the installation. The user has to set information about the Kubernetes cluster, the used Bevel installation, the used Hashicorp Vault and details about the organizations. It automately creates each individual peer based on the quantity set for each organization. The region, if defined, sets the organization in the corresponding region in the network emulation.

```yaml
domain_name: svc.cluster.local # 
pathToBAF: /home/ubuntu/c2b2/blockchain-automation-framework # path to Bevel/Blockchain Automation Framework
cloud_provider: minikube # cloud type (minikube can be used on-premises)

BAFChaincodePath: examples/supplychain-app/fabric/chaincode_rest_server/chaincode/ # path to the chaincode

BAFk8s: # informations on the Kubernetes cluster target
  context: "cluster.local" 
  config_file: "~/.kube/config"

vault: # Informations on the Hashicorp Vault used to store secrets
  url: "http://10.10.2.4:30000"
  root_token: "s.2GHpHvwF2P08YFXfxVaEO7yV"


organizations: # List of target organizations
- id: 1
  name: carrier
  orderer: supplychain
  numberOfPeers: 1 #if 0 then endorser should be false 
  endorser: true #if false then numberOfPeers should be 0 (even if not, the script will count it as 0)
  region: westeurope

- id: 2
  name: manufacturer
  orderer: supplychain
  numberOfPeers: 1
  endorser: true
  region: westeurope

- id: 3
  name: buyer
  orderer: supplychain
  numberOfPeers: 1
  endorser: true
  region: eastus

- id: 4
  name: supplychain
  orderer: supplychain
  numberOfPeers: 2
  endorser: false
  region: japaneast
```

### Injector configuration

This file describe how will behave the Caliper injector. The user has to set general information of the used chaincode, the used Caliper installation and the injection details. More information on the usable injection controls are available on the [Caliper documentation](https://hyperledger.github.io/caliper/v0.4.2/rate-controllers/).

```yaml
chaincode_name: simpleauction
chaincode_version: "1"
chaincode_lang: golang
chaincode_init_function: init
chaincode_path: simpleauction/
initArguments: []
created: true
replicaMasterCount: 1 # number of Caliper leader nodes
replicaWorkersCount: 1 # number of Caliper worker nodes
caliperImageRepository: ayhamkassab/caliper # Caliper Docker image 
rateControl: # Injection rate control options
  type: fixed-load
  opts:
    tps: 20
    load: 1
```

### Network emulation configuration file

This configuration file is used to generate ChaosMesh network emulation parameters for each organization. Links are by default bidirectional.

```yaml
regions:
- name: "westeurope"
- name: "eastus"
- name: "japaneast"
links:
- origin: "westeurope"
  dest: "eastus"
  latency: 82
  jitter: 7.778
- origin: "westeurope"
  dest: "japaneast"
  latency: 229
  jitter: 7.778
- origin: "eastus"
  dest: "japaneast"
  latency: 102
  jitter: 4.950
```


## Usage

Once the prerequisites are installed, you should set the parameters in the [ourAutomation](./ourAutomation) directory, and execute the [run.sh](./run.sh) file. More details on the placement are available in this file.

## Additional details on DSN experimentations

### Storage

To store our result experiments, we use [Minio](https://min.io/) and 
the  [Local path provisioner](https://github.com/rancher/local-path-provisioner) storage engine. Both should be deployed initially.

### Secrets

Bevel employs [Hashicorp Vault](https://www.vaultproject.io/) for the users, peers and endorsers management. The installation of Vault needs to be setup for the management of secrets:

```bash
helm repo add hashicorp https://helm.releases.hashicorp.com  
helm install vault hashicorp/vault  --set "server.dataStorage.storageClass=local-path" --set server.service.type=NodePort --set server.service.nodePort=30000 --set injector.agentImage.tag=1.0.1 --set server.image.tag=1.0.1  

# once Vault is running..
kubectl exec -it vault-0 /bin/sh 
vault operator init  
```

The obtained result should look like this:

```bash
Unseal Key 1: xjDXbvfa19fpr2B63cr1ngzjPlB7bJn0qpamBoXCMg9S  

Unseal Key 2: poDXAItARqFITfvV48fWTfpdtff1J2RRrJkwBu3yqnPg  

Unseal Key 3: I1NW0sE76E7ducGo+2+Xw+obhFUsIyaRwDzoiMbOWJrn  

Unseal Key 4: 22yxVrSqUNu7fCz06cdbpKqyXKM5YKANfWq8eyjt3HDo  

Unseal Key 5: T9xh5nUPCylWpZ1mO4yv39scQjAZyYx7PueN+TpEqJbH  

Initial Root Token: s.a8GUWx72B5UoxbvFAaYJY0gu  
```

You have to unseal each key after having initialized the `VAULT_TOKEN` to the initial root token value:
```bash
export VAULT_TOKEN="s.a8GUWx72B5UoxbvFAaYJY0gu" # replace with the root token 
# for each key:
vault operator unseal <key>
```

Now the vault is running and unsealed. If necessary, the vault UI is reachable by exposing port 8200 of the `vault` pod and accessing `http://localhost:8200/ui` (if port-forwarded locally).

### Gitops

Bevel uses [Flux](https://fluxcd.io/) for the management of the deployment of Fabric (installation of Pods, Helm charts, etc.). Flux permits to manage a Kubernetes cluster using Git repository and commits. Appropriate values should be set for the used GitHub repository. More details are available in [the additional generator file](ourAutomation/ModifAddTabTOConfigFile.py).