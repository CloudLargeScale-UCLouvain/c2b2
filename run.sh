echo "Creating configuration files"

cd ourAutomation
./generateCaliperConfig.sh 

echo "Configuration files created."


echo "Deploying the network"


cd ../../blockchain-automation-framework/


export PATH=/usr/local/bin:~/bin:/home/ubuntu/.vscode-server/bin/e7d7e9a9348e6a8cc8c03f877d39cb72e5dfb1ff/bin:/home/ubuntu/.local/bin:/home/ubuntu/bin:/usr/local/sbin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
#export PATH=/usr/local/bin:$PATH
#export PATH=$PATH:~/bin
export VAULT_ADDR='http://10.10.2.4:30000'
export VAULT_TOKEN="s.2GHpHvwF2P08YFXfxVaEO7yV"
#export PATH=$PATH:/home/ubuntu/.local/bin
#alias kubectl='/usr/local/bin/kubectl'
#alias helm='/usr/local/bin/helm'
kubectl version --short
helm version
vault status

exec ansible-playbook  /home/ubuntu/c2b2/blockchain-automation-framework/platforms/shared/configuration/site.yaml -e "@/home/ubuntu/c2b2/c2b2-controller/ourAutomation/bafNetwork.yaml" -i inventory.ini -e 'ansible_python_interpreter=/usr/bin/python3'