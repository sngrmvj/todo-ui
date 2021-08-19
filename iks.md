IKS Deployment
Concept diagram

Multizone cluster is deployed with private only networking. Communication with IKS masters, the IBM Cloud Container Registry, and other IBM Cloud services is done via private service endpoints. Ingress communication is only allowed via the ALBs and NLBs. For HTTP/HTTPS the connection is terminated by the ALB, therefore return traffic goes back through the ALB. For TACACS connections the return traffic will come directly from the node servicing the connection, but will be sourced using the NLB address, allowing for stateful inspection by the BlueFringe firewall. Egress communication will come directly from the node addresses and will go through BlueFringe, including Internet destined traffic (w3id, Artifactory).

Prerequisites

    The IBM Cloud account will need to have private service endpoints enabled.

    $ ibmcloud account update --service-endpoint-enable true
    $ ibmcloud account show
    Retrieving account Network Engineering Hosting of macarpen@us.ibm.com...
    OK

    Account Name:                       Network Engineering Hosting
    Account ID:                         2d69a387884748f589e5af22e5991b67
    Account Owner:                      nethost@us.ibm.com
    Account Type:                       PAYG
    Account Status:                     ACTIVE
    Linked Softlayer Account:           1931591
    VRF Enabled:                        true
    Service Endpoint Enabled:           true
    EU Supported                        false
    PoC (Commercial Proof of Concept)   false
    HIPAA Supported                     false

    A resource group will need to be created if one does not already exist.

    $ ibmcloud resource group-create 'AAAaaS Development'
    Creating resource group AAAaaS Development under account Network Engineering Hosting as macarpen@us.ibm.com...
    OK
    Resource group AAAaaS Development was created.
    Resource Group ID: a59d8bc0f49243fe9026b0e351b5ca63

Deploying a cluster

    Target the account the cluster will be created in (ibmcloud account list will provide a list of accounts).

    $ ibmcloud target -c 2d69a387884748f589e5af22e5991b67
    Targeted account Network Engineering Hosting (2d69a387884748f589e5af22e5991b67) <-> 1931591

    Targeted resource group Default

    API endpoint:      https://cloud.ibm.com
    Region:            us-south
    User:              macarpen@us.ibm.com
    Account:           Network Engineering Hosting (2d69a387884748f589e5af22e5991b67) <-> 1931591
    Resource group:    Default
    CF API endpoint:
    Org:
    Space:

    Target the resource group the cluster will be created in (ibmcloud resource groups will provide a list of resource groups).

    $ ibmcloud target -g a59d8bc0f49243fe9026b0e351b5ca63
    Targeted resource group AAAaaS Development

    API endpoint:      https://cloud.ibm.com
    Region:            us-south
    User:              macarpen@us.ibm.com
    Account:           Network Engineering Hosting (2d69a387884748f589e5af22e5991b67) <-> 1931591
    Resource group:    AAAaaS Development
    CF API endpoint:
    Org:
    Space:

    Target the region the cluster will be created in (ibmcloud ks regions will provide a list of regions).

    $ ibmcloud target -r us-south
    Switched to region us-south

    API endpoint:      https://cloud.ibm.com
    Region:            us-south
    User:              macarpen@us.ibm.com
    Account:           Network Engineering Hosting (2d69a387884748f589e5af22e5991b67) <-> 1931591
    Resource group:    AAAaaS Development
    CF API endpoint:
    Org:
    Space:

    Set some environment variables.

    $ export CLUSTER_NAME=aaa-dev
    $ export CLUSTER_ZONE=dal10
    $ export CLUSTER_VERSION=1.14.3 # ibmcloud ks versions
    $ export CLUSTER_MACHINE_TYPE=b3c.4x16 # ibmcloud ks machine-types --zone $CLUSTER_ZONE
    $ export CLUSTER_ADDITIONAL_ZONES="dal12" # space separated

    Create a private VLAN in the zone.

    $ ibmcloud sl vlan create -f \
      -t private \
      -d $CLUSTER_ZONE \
      -n $CLUSTER_NAME-$CLUSTER_ZONE
    OK
    The order 42039383 was placed.

    # Wait for the VLAN to be provisioned
    $ ibmcloud ks vlan-ls --zone $CLUSTER_ZONE
    OK
    ID        Name              Number   Type      Router         Supports Virtual Workers
    2652231   aaa-dev-dal10   1428     private   bcr01a.dal10   true

    $ export CLUSTER_PRIVATE_VLAN=$(ibmcloud ks vlan-ls --zone $CLUSTER_ZONE --json | jq -r ".[] | select(.properties.name == \"$CLUSTER_NAME-$CLUSTER_ZONE\").id")

    Create a private network only, single zone cluster.

    $ ibmcloud ks cluster-create \
      --name $CLUSTER_NAME \
      --kube-version $CLUSTER_VERSION \
      --zone $CLUSTER_ZONE \
      --machine-type $CLUSTER_MACHINE_TYPE \
      --private-vlan $CLUSTER_PRIVATE_VLAN \
      --private-only \
      --workers 1 \
      --hardware shared \
      --private-service-endpoint \
      --public-service-endpoint
    Creating cluster...
    OK

    $ ibmcloud ks clusters
    OK
    Name      ID                                 State    Created          Workers   Location   Version       Resource Group Name
    aaa-dev   f344bacf07ce4a379781981446f09f72   normal   41 minutes ago   1         Dallas     1.14.3_1523   AAAaaS Development

    Create a private VLAN in the additional zones.

    for zone in $CLUSTER_ADDITIONAL_ZONES; do ibmcloud sl vlan create -f -t private -d $zone -n $CLUSTER_NAME-$zone; done
    OK
    The order 42042853 was placed.

    # Wait for the VLANs to be provisioned
    $ for zone in $CLUSTER_ADDITIONAL_ZONES; do ibmcloud ks vlan-ls --zone $zone; done
    OK
    ID        Name            Number   Type      Router         Supports Virtual Workers
    2652255   aaa-dev-dal12   1423     private   bcr01a.dal12   true

    Add additional zones to the worker pool.

    $ for zone in $CLUSTER_ADDITIONAL_ZONES; do vlan=$(ibmcloud ks vlan-ls --zone $zone --json | jq -r ".[] | select(.properties.name == \"$CLUSTER_NAME-$zone\").id"); ibmcloud ks zone-add --cluster $CLUSTER_NAME --zone $zone --worker-pools default --private-vlan $vlan --private-only; done
    OK

    $ ibmcloud ks worker-pool get --cluster $CLUSTER_NAME --worker-pool default
    Retrieving worker pool default from cluster aaa-dev...
    OK

    Name:               default
    ID:                 f344bacf07ce4a379781981446f09f72-4c66f7a
    State:              active
    Hardware:           shared
    Zones:              dal10,dal12
    Workers per Zone:   1
    Labels:             ibm-cloud.kubernetes.io/worker-pool-id=f344bacf07ce4a379781981446f09f72-4c66f7a
    Machine Type:       b3c.4x16.encrypted

    $ ibmcloud ks workers --cluster $CLUSTER_NAME --worker-pool default
    OK
    ID                                                 Public IP   Private IP       Machine Type         State               Status   Zone    Version
    kube-dal10-crf344bacf07ce4a379781981446f09f72-w1   -           10.177.181.199   b3c.4x16.encrypted   normal              Ready    dal10   1.14.3_1524
    kube-dal12-crf344bacf07ce4a379781981446f09f72-w2   -           -                b3c.4x16.encrypted   provision_pending   -        dal12   1.14.3_1524

    Enable the private ALBs.

    # Wait for all worker nodes to provision
    $ for alb in $(ibmcloud ks albs --cluster $CLUSTER_NAME --json | jq -r '.[] | select(.enable == false ).albID'); do ibmcloud ks alb-configure --albID $alb --enable; done

    # Wait for the ALBs to provision
    $ ibmcloud ks albs --cluster $CLUSTER_NAME
    OK
    ALB ID                                            Enabled   Status    Type      ALB IP         Zone    Build                          ALB VLAN ID
    private-crf344bacf07ce4a379781981446f09f72-alb1   true      enabled   private   10.176.13.85   dal10   ingress:477/ingress-auth:331   2652231
    private-crf344bacf07ce4a379781981446f09f72-alb2   true      enabled   private   10.184.49.66   dal12   ingress:477/ingress-auth:331   2652255

    Add the worker nodes to the BlueFrine collection.

    $ export BF_ORGID=40
    $ export BF_WORKER_NODE_COLLECTION_NAME=AAA-DEV-WORKER-NODES
    $ for worker in $(ibmcloud ks workers --cluster $CLUSTER_NAME --worker-pool default --json | jq -r '.[].privateIP'); do bluefringe collectionsservice addips --ORGID $BF_ORGID --collectionName $BF_WORKER_NODE_COLLECTION_NAME --data "{\"ips\":[\"$worker\"]}"; done
    CollectionsServiceAPI addIPs --collectionName AAA-DEV-WORKER-NODES --ORGID 40 --environment <unset> --data {"ips":["10.177.181.199"]}
    Operation successful.
    CollectionList:
    ORGID       : 40
    Environment : att
    Name        : AAA-DEV-WORKER-NODES
    Description : AAAaaS development cluster worker nodes
    Ips         :
    10.177.181.199
    Collections :
    Metadata    : null
    CollectionsServiceAPI addIPs --collectionName AAA-DEV-WORKER-NODES --ORGID 40 --environment <unset> --data {"ips":["10.185.148.190"]}
    Operation successful.
    CollectionList:
    ORGID       : 40
    Environment : att
    Name        : AAA-DEV-WORKER-NODES
    Description : AAAaaS development cluster worker nodes
    Ips         :
    10.177.181.199
    10.185.148.190
    Collections :
    Metadata    : null

    Add the ALBs to the BlueFringe collection.

    $ export BF_ALB_COLLECTION_NAME=AAA-DEV-ALBS
    $ for alb in $(ibmcloud ks albs --cluster $CLUSTER_NAME --json | jq -r '.[] | select(.albType == "private").albip'); do bluefringe collectionsservice addips --ORGID $BF_ORGID --collectionName $BF_ALB_COLLECTION_NAME --data "{\"ips\":[\"$alb\"]}"; done
    CollectionsServiceAPI addIPs --collectionName AAA-DEV-ALBS --ORGID 40 --environment <unset> --data {"ips":["10.176.13.85"]}
    Operation successful.
    CollectionList:
    ORGID       : 40
    Environment : att
    Name        : AAA-DEV-ALBS
    Description : AAAaaS development cluster ALBs
    Ips         :
    10.176.13.85
    Collections :
    Metadata    : null
    CollectionsServiceAPI addIPs --collectionName AAA-DEV-ALBS --ORGID 40 --environment <unset> --data {"ips":["10.184.49.66"]}
    Operation successful.
    CollectionList:
    ORGID       : 40
    Environment : att
    Name        : AAA-DEV-ALBS
    Description : AAAaaS development cluster ALBs
    Ips         :
    10.176.13.85
    10.184.49.66
    Collections :
    Metadata    : null

    Open a ticket to allow capacity aggregation for the private VLANs (reference).

    Log in to the IBM Cloud console
    From the menu bar, click Support, click the Manage cases tab, and click Create new case
    For type of support, select Technical
    For category, select VLAN Spanning
    For subject, enter Private VLAN Network Question
    Add the following information to the description (replacing with the VLANs created above):

        Please set up the network to allow capacity aggregation on the private VLANs aaa-dev-dal10 (2652231), aaa-dev-dal12 (2652255), and aaa-dev-dal13 (2652267). The reference ticket for this request is: https://control.softlayer.com/support/tickets/63859145

    Create an instance of IBM Certificate Manager and upload the respective certificate and keys.
    Import the certificates and keys to the cluster

    $ ibmcloud ks alb-cert-deploy --cluster $CLUSTER_NAME --secret-name aaa-dev.innovate.ibm.com --cert-crn <CRN>
    Deploying ALB Certificate...
    OK

    $ ibmcloud ks alb-cert-deploy --cluster $CLUSTER_NAME --secret-name aaa-stage.innovate.ibm.com --cert-crn <CRN>
    Deploying ALB Certificate...
    OK

    Download and source the cluster configuration.

    $ ibmcloud ks cluster-config $CLUSTER_NAME
    OK
    The configuration for aaa-dev was downloaded successfully.

    Export environment variables to start using Kubernetes.

    export KUBECONFIG=/Users/mike/.bluemix/plugins/container-service/clusters/aaa-dev/kube-config-dal10-aaa-dev.yml

    $ export KUBECONFIG=/Users/mike/.bluemix/plugins/container-service/clusters/aaa-dev/kube-config-dal10-aaa-dev.yml

    Create the application namespace.

    $ export CLUSTER_NAMESPACES="dev stage"
    $ for ns in $CLUSTER_NAMESPACES; do kubectl create ns $ns; done
    namespace/dev created
    namespace/stage created

    Create the API deployer RBAC policy.

    $ for ns in $CLUSTER_NAMESPACES
    do
    cat << EOF | kubectl -n $ns apply -f -
    ---
    apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: aaa-api-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    metadata:
      name: aaa-api-deployer
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: Role
      name: aaa-api-deployer
    subjects:
      - kind: ServiceAccount
        name: aaa-api-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    metadata:
      name: aaa-api-deployer
    rules:
      - apiGroups: [""]
        resourceNames: ["aaa-api-registry", "aaa-api-tls", "aaa-api-env", "aaa-db-tls", "aaa-elasticsearch-tls", "sigsci-agent-env", "contrast"]
        resources: ["secrets"]
        verbs: ["get", "patch"]
      - apiGroups: ["", "extensions", "apps"]
        resourceNames: ["aaa-api", "aaa-ingress", "contrast-service"]
        resources: ["services", "ingresses", "deployments"]
        verbs: ["get", "patch"]
      - apiGroups: ["", "extensions", "apps"]
        resources: ["secrets", "services", "ingresses", "deployments"]
        verbs: ["create"]
    EOF
    done
    serviceaccount/aaa-api-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-api-deployer created
    role.rbac.authorization.k8s.io/aaa-api-deployer created
    serviceaccount/aaa-api-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-api-deployer created
    role.rbac.authorization.k8s.io/aaa-api-deployer created

    Create the UI deployer RBAC policy.

    $ for ns in $CLUSTER_NAMESPACES
    do
    cat << EOF | kubectl -n $ns apply -f -
    ---
    apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: aaa-ui-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    metadata:
      name: aaa-ui-deployer
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: Role
      name: aaa-ui-deployer
    subjects:
      - kind: ServiceAccount
        name: aaa-ui-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    metadata:
      name: aaa-ui-deployer
    rules:
      - apiGroups: [""]
        resourceNames: ["aaa-ui-registry", "aaa-ui-tls"]
        resources: ["secrets"]
        verbs: ["get", "patch"]
      - apiGroups: ["", "extensions", "apps"]
        resourceNames: ["aaa-ui"]
        resources: ["services", "deployments"]
        verbs: ["get", "patch"]
      - apiGroups: ["", "extensions", "apps"]
        resources: ["secrets", "services", "deployments"]
        verbs: ["create"]
    EOF
    done
    serviceaccount/aaa-ui-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-ui-deployer created
    role.rbac.authorization.k8s.io/aaa-ui-deployer created
    serviceaccount/aaa-ui-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-ui-deployer created
    role.rbac.authorization.k8s.io/aaa-ui-deployer created

    Create the controller deployer RBAC policy.

    $ for ns in $CLUSTER_NAMESPACES
    do
    cat << EOF | kubectl -n $ns apply -f -
    ---
    apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: aaa-controller-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    metadata:
      name: aaa-controller-deployer
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: Role
      name: aaa-controller-deployer
    subjects:
      - kind: ServiceAccount
        name: aaa-controller-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    metadata:
      name: aaa-controller-deployer
    rules:
      - apiGroups: [""]
        resourceNames: ["aaa-controller-registry"]
        resources: ["secrets"]
        verbs: ["get", "patch"]
      - apiGroups: ["batch"]
        resourceNames: ["aaa-tacacs-deployer", "aaa-logstash-deployer", "aaa-radius-deployer"]
        resources: ["cronjobs"]
        verbs: ["get", "patch"]
      - apiGroups: ["", "batch"]
        resources: ["secrets", "cronjobs"]
        verbs: ["create"]
    EOF
    done
    serviceaccount/aaa-controller-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-controller-deployer created
    role.rbac.authorization.k8s.io/aaa-controller-deployer created
    serviceaccount/aaa-controller-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-controller-deployer created
    role.rbac.authorization.k8s.io/aaa-controller-deployer created

    Create the logstash deployer RBAC policy.

    $ for ns in $CLUSTER_NAMESPACES
    do
    cat << EOF | kubectl -n $ns apply -f -
    ---
    apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: aaa-logstash-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    metadata:
      name: aaa-logstash-deployer
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: Role
      name: aaa-logstash-deployer
    subjects:
      - kind: ServiceAccount
        name: aaa-logstash-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    metadata:
      name: aaa-logstash-deployer
    rules:
      - apiGroups: ["", "extensions", "apps"]
        resources: ["configmaps", "deployments", "services"]
        verbs: ["create"]
      - apiGroups: ["", "extensions", "apps"]
        resources: ["configmaps", "deployments", "services"]
        resourceNames: ["aaa-logstash"]
        verbs: ["get", "update"]
    EOF
    done
    serviceaccount/aaa-logstash-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-logstash-deployer created
    role.rbac.authorization.k8s.io/aaa-logstash-deployer created
    serviceaccount/aaa-logstash-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-logstash-deployer created
    role.rbac.authorization.k8s.io/aaa-logstash-deployer created

    Create the TACACS deployer RBAC policy.

    $ for ns in $CLUSTER_NAMESPACES
    do
    cat << EOF | kubectl -n $ns apply -f -
    ---
    apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: aaa-tacacs-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    metadata:
      name: aaa-tacacs-deployer
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: Role
      name: aaa-tacacs-deployer
    subjects:
      - kind: ServiceAccount
        name: aaa-tacacs-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    metadata:
      name: aaa-tacacs-deployer
    rules:
      - apiGroups: ["", "extensions", "apps"]
        resources: ["configmaps", "deployments", "services"]
        verbs: ["create"]
      - apiGroups: ["", "extensions", "apps"]
        resources: ["configmaps", "deployments"]
        resourceNames: ["aaa-tacacs"]
        verbs: ["get", "update"]
      - apiGroups: ["", "extensions"]
        resources: ["services"]
        resourceNames: ["aaa-tacacs-nlb-dal10", "aaa-tacacs-nlb-dal12", "aaa-tacacs-nlb-dal13"]
        verbs: ["get", "update"]
    EOF
    done
    serviceaccount/aaa-tacacs-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-tacacs-deployer created
    role.rbac.authorization.k8s.io/aaa-tacacs-deployer created
    serviceaccount/aaa-tacacs-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-tacacs-deployer created
    role.rbac.authorization.k8s.io/aaa-tacacs-deployer created

    Create the RADIUS deployer RBAC policy.

    $ for ns in $CLUSTER_NAMESPACES
    do
    cat << EOF | kubectl -n $ns apply -f -
    ---
    apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: aaa-radius-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    metadata:
      name: aaa-radius-deployer
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: Role
      name: aaa-radius-deployer
    subjects:
      - kind: ServiceAccount
        name: aaa-radius-deployer
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    metadata:
      name: aaa-radius-deployer
    rules:
    - apiGroups: ["", "apps"]
      resources: ["secrets", "services", "deployments"]
      verbs: ["create"]
    - apiGroups: ["", "apps"]
      resources: ["secrets", "deployments"]
      resourceNames: ["aaa-radius"]
      verbs: ["get", "update"]
    - apiGroups: [""]
      resources: ["services"]
      resourceNames:
        - aaa-radius-auth-udp-nlb-dal10
        - aaa-radius-auth-udp-nlb-dal12
        - aaa-radius-auth-udp-nlb-dal13
        - aaa-radius-auth-tcp-nlb-dal10
        - aaa-radius-auth-tcp-nlb-dal12
        - aaa-radius-auth-tcp-nlb-dal13
      verbs: ["get", "update"]
    EOF
    done
    serviceaccount/aaa-radius-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-radius-deployer created
    role.rbac.authorization.k8s.io/aaa-radius-deployer created
    serviceaccount/aaa-radius-deployer created
    rolebinding.rbac.authorization.k8s.io/aaa-radius-deployer created
    role.rbac.authorization.k8s.io/aaa-radius-deployer created

    Configure the cluster DNS settings.

    $ cat << EOF | kubectl -n kube-system apply -f -
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: coredns
      namespace: kube-system
    data:
      Corefile: |
        ibm.com 9.in-addr.arpa {
            forward . 9.0.128.50 9.0.130.50
        }
        .:53 {
            errors
            health
            kubernetes cluster.local in-addr.arpa ip6.arpa {
                pods insecure
                upstream
                fallthrough in-addr.arpa ip6.arpa
            }
            prometheus :9153
            forward . /etc/resolv.conf
            cache 30
            loop
            reload
            loadbalance
        }
    EOF
    Warning: kubectl apply should be used on resource created by either kubectl create --save-config or kubectl apply
    configmap/coredns configured

    Enable source IP preservation on the private ALBs.

    $ kubectl get svc -n kube-system | grep alb | awk '{print $1}' | grep "^private" | while read alb; do kubectl patch svc $alb -n kube-system -p '{"spec":{"externalTrafficPolicy":"Local"}}'; done
    service/private-crf344bacf07ce4a379781981446f09f72-alb1 patched
    service/private-crf344bacf07ce4a379781981446f09f72-alb2 patched

Provision the elastic components

    Create the elasticsearch database.

    $ export ES_DEPLOYMENT_NAME=aaa-dev-elasticsearch
    # TODO: CLI command to create elasticsearch database
    $ ibmcloud cdb about $ES_DEPLOYMENT_NAME
               Field                    Value
    Detail     Id                       crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f::
               Name                     crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f::
               Type                     elasticsearch
               Version                  6.7
               Options                  map[key_protect_key_id:]
               Admin                    admin

    Resource   Name                     aaa-dev-elasticsearch
               ID                       crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f::
               GUID                     75ff66a9-f89a-4f4b-af00-8ace66fe496f
               Region ID                us-south
               Resource Plan ID         databases-for-elasticsearch-standard
               State                    active
               Type                     service_instance
               Last Operation Status    succeeded
               Last Operation Message   Provisioning elasticsearch with version 6.7. (100%)
               Last Operation Updated   2019-06-28T16:08:34.248912546Z

    Create an elasticsearch user for Kibana, APM, and Curator.

    $ export ES_APM_USER_NAME=apm
    $ export ES_APM_PASSWORD=$(openssl rand -base64 32 | md5)
    $ export ES_KIBANA_USER_NAME=kibana
    $ export ES_KIBANA_PASSWORD=$(openssl rand -base64 32 | md5)
    $ export ES_CURATOR_USER_NAME=curator
    $ export ES_CURATOR_PASSWORD=$(openssl rand -base64 32 | md5)

    $ ibmcloud cdb user-create $ES_DEPLOYMENT_NAME $ES_APM_USER_NAME $ES_APM_PASSWORD
    The user is being created with this task:

    Key                   Value
    ID                    crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f:task:52225dd6-01a6-4ea7-902d-fca0fdf29b92
    Deployment ID         crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f::
    Description           Creating user.
    Created At            2019-07-02T17:32:27Z
    Status                running
    Progress Percentage   0

    Status                completed
    Progress Percentage   100
    Location              https://api.us-south.databases.cloud.ibm.com/v4/ibm/deployments/crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a%2F2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f::
    OK

    $ ibmcloud cdb user-create $ES_DEPLOYMENT_NAME $ES_KIBANA_USER_NAME $ES_KIBANA_PASSWORD
    The user is being created with this task:

    Key                   Value
    ID                    crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f:task:d8062286-5a74-4c74-85da-05efba4477c2
    Deployment ID         crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f::
    Description           Creating user.
    Created At            2019-07-02T17:37:00Z
    Status                running
    Progress Percentage   0

    Progress Percentage   100
    OK

    $ ibmcloud cdb user-create $ES_DEPLOYMENT_NAME $ES_CURATOR_USER_NAME $ES_CURATOR_PASSWORD
    The user is being created with this task:

    Key                   Value
    ID                    crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:b99e00b0-5d0c-462a-9bf2-946cbba3aef6:task:08325c36-a221-4a13-aa58-5d92bbe636d1
    Deployment ID         crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:b99e00b0-5d0c-462a-9bf2-946cbba3aef6::
    Description           Creating user.
    Created At            2019-09-20T16:52:48Z
    Status                running
    Progress Percentage   0

    Status                completed
    Progress Percentage   100
    Location              https://api.us-south.databases.cloud.ibm.com/v4/ibm/deployments/crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a%2F2d69a387884748f589e5af22e5991b67:b99e00b0-5d0c-462a-9bf2-946cbba3aef6::
    OK

    $ export ES_DEPLOYMENT_PUBLIC_HOSTNAME=$(ibmcloud cdb cxn $ES_DEPLOYMENT_NAME -e public -j | jq -r '.connection.https.hosts[0].hostname')
    $ export ES_DEPLOYMENT_PRIVATE_HOSTNAME=$(ibmcloud cdb cxn $ES_DEPLOYMENT_NAME -e private -j | jq -r '.connection.https.hosts[0].hostname')
    $ export ES_DEPLOYMENT_PUBLIC_PORT=$(ibmcloud cdb cxn $ES_DEPLOYMENT_NAME -e public -j | jq -r '.connection.https.hosts[0].port')
    $ export ES_DEPLOYMENT_PRIVATE_PORT=$(ibmcloud cdb cxn $ES_DEPLOYMENT_NAME -e private -j | jq -r '.connection.https.hosts[0].port')
    $ export ES_DEPLOYMENT_PUBLIC_PATH=$(ibmcloud cdb cxn $ES_DEPLOYMENT_NAME -e public -j | jq -r '.connection.https.path')
    $ export ES_DEPLOYMENT_PRIVATE_PATH=$(ibmcloud cdb cxn $ES_DEPLOYMENT_NAME -e private -j | jq -r '.connection.https.path')
    $ export ES_DEPLOYMENT_CERT_BASE64=$(ibmcloud cdb cxn $ES_DEPLOYMENT_NAME -e private -j | jq -r '.connection.https.certificate.certificate_base64')
    $ export ES_DEPLOYMENT_CERT_NAME=$(ibmcloud cdb cxn $ES_DEPLOYMENT_NAME -e private -j | jq -r '.connection.https.certificate.name')
    $ export ES_DEPLOYMENT_VERSION=$(curl -k -u $ES_APM_USER_NAME:$ES_APM_PASSWORD https://$ES_DEPLOYMENT_PUBLIC_HOSTNAME:$ES_DEPLOYMENT_PUBLIC_PORT$ES_DEPLOYMENT_PUBLIC_PATH | jq -r '.version.number')

    Download and source the cluster configuration.

    $ ibmcloud ks cluster-config $CLUSTER_NAME
    OK
    The configuration for aaa-dev was downloaded successfully.

    Export environment variables to start using Kubernetes.

    export KUBECONFIG=/Users/mike/.bluemix/plugins/container-service/clusters/aaa-dev/kube-config-dal10-aaa-dev.yml

    $ export KUBECONFIG=/Users/mike/.bluemix/plugins/container-service/clusters/aaa-dev/kube-config-dal10-aaa-dev.yml

    Create the elastic namespace.

    $ kubectl create ns elastic
    namespace/elastic created

    Create the elasticsearch TLS secret.

    $ cat << EOF | kubectl -n elastic apply -f -
    apiVersion: v1
    data:
      tls.crt: $ES_DEPLOYMENT_CERT_BASE64
      tls.key: ""
    kind: Secret
    metadata:
      name: elasticsearch-tls
      labels:
        version: $ES_DEPLOYMENT_CERT_NAME
    type: kubernetes.io/tls
    EOF
    secret/elasticsearch-tls created

    Create the APM service.

    $ cat << EOF | kubectl -n elastic apply -f -
    apiVersion: v1
    kind: Service
    metadata:
      labels:
        app: elastic
        component: apm
      name: elastic-apm
    spec:
      ports:
      - name: http
        port: 8200
        protocol: TCP
        targetPort: 8200
      selector:
        app: elastic
        component: apm
      sessionAffinity: None
      type: ClusterIP
    EOF
    service/elastic-apm created

    Create the APM configmap.

    $ cat << EOF | kubectl -n elastic apply -f -
    apiVersion: v1
    data:
      apm-server.yml: |-
        apm-server:
          host: "0.0.0.0:8200"
        output.elasticsearch:
          hosts: ["https://$ES_DEPLOYMENT_PRIVATE_HOSTNAME:$ES_DEPLOYMENT_PRIVATE_PORT$ES_DEPLOYMENT_PRIVATE_PATH"]
          protocol: https
          username: $ES_APM_USER_NAME
          password: $ES_APM_PASSWORD
          ssl.supported_protocols: [TLSv1.2]
          ssl.verification_mode: full
          ssl.certificate_authorities: ["/etc/pki/tls/certs/elasticsearch.crt"]
    kind: ConfigMap
    metadata:
      labels:
        app: elastic
        component: apm
      name: elastic-apm
    EOF
    configmap/elastic-apm created

    Create the APM deployment.

    $ cat << EOF | kubectl -n elastic apply -f -
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      labels:
        app: elastic
        component: apm
      name: elastic-apm
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: elastic
          component: apm
      template:
        metadata:
          labels:
            app: elastic
            component: apm
        spec:
          containers:
          - image: docker.elastic.co/apm/apm-server-oss:$ES_DEPLOYMENT_VERSION
            resources:
              limits:
                memory: 20Mi
              requests:
                memory: 10Mi
                cpu: 25m
            name: apm-server
            ports:
            - containerPort: 8200
              name: apm-server
              protocol: TCP
            volumeMounts:
            - mountPath: /usr/share/apm-server/apm-server.yml
              name: apm-server-config
              readOnly: true
              subPath: apm-server.yml
            - name: elasticsearch-cert
              mountPath: /etc/pki/tls/certs/elasticsearch.crt
              readOnly: true
              subPath: elasticsearch.crt
          volumes:
          - name: apm-server-config
            configMap:
              name: elastic-apm
              items:
              - key: apm-server.yml
                path: apm-server.yml
          - name: elasticsearch-cert
            secret:
              secretName: elasticsearch-tls
              items:
              - key: tls.crt
                path: elasticsearch.crt
    EOF
    deployment.extensions/elastic-apm created

    Create an instance of App ID to integrate with w3id. (instructions)
    In the App ID Authentication settings tab, add a redirect URL e.g. https://<hostname>/<app_path>/appid_callback
    Bind the App ID instance to the elastic namespace.

    $ ibmcloud ks cluster-service-bind --cluster $CLUSTER_NAME --service aaa-dev-appid --namespace elastic
    Binding service instance to namespace...
    OK

    Create the Kibana service.

    $ cat << EOF | kubectl -n elastic apply -f -
    apiVersion: v1
    kind: Service
    metadata:
      labels:
        app: elastic
        component: kibana
      name: elastic-kibana
    spec:
      ports:
      - name: http
        port: 5601
        protocol: TCP
        targetPort: 5601
      selector:
        app: elastic
        component: kibana
      sessionAffinity: None
      type: ClusterIP
    EOF
    service/elastic-kibana created

    Create the kibana configmap.

    $ cat << EOF | kubectl -n elastic apply -f -
    apiVersion: v1
    data:
      kibana.yml: |-
        elasticsearch.hosts: ["https://$ES_DEPLOYMENT_PRIVATE_HOSTNAME:$ES_DEPLOYMENT_PRIVATE_PORT$ES_DEPLOYMENT_PRIVATE_PATH"]
        elasticsearch.username: $ES_KIBANA_USER_NAME
        elasticsearch.password: $ES_KIBANA_PASSWORD
        elasticsearch.ssl.verificationMode: full
        elasticsearch.ssl.certificateAuthorities: ["/etc/pki/tls/certs/elasticsearch.crt"]
        server.host: 0.0.0.0
        server.basePath: /kibana
        server.rewriteBasePath: true
    kind: ConfigMap
    metadata:
      labels:
        app: elastic
        component: kibana
      name: elastic-kibana
    EOF
    configmap/elastic-kibana created

    Create the kibana deployment.

    $ cat << EOF | kubectl -n elastic apply -f -
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      labels:
        app: elastic
        component: kibana
      name: elastic-kibana
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: elastic
          component: kibana
      template:
        metadata:
          labels:
            app: elastic
            component: kibana
        spec:
          restartPolicy: Always
          containers:
          - image: docker.elastic.co/kibana/kibana-oss:$ES_DEPLOYMENT_VERSION
            resources:
              limits:
                memory: 150Mi
              requests:
                memory: 100Mi
                cpu: 25m
            imagePullPolicy: IfNotPresent
            name: kibana
            ports:
            - containerPort: 5601
              protocol: TCP
            volumeMounts:
            - name: kibana-config
              mountPath: /usr/share/kibana/config/kibana.yml
              readOnly: true
              subPath: kibana.yml
            - name: elasticsearch-cert
              mountPath: /etc/pki/tls/certs/elasticsearch.crt
              readOnly: true
              subPath: elasticsearch.crt
          volumes:
          - name: kibana-config
            configMap:
              name: elastic-kibana
              items:
              - key: kibana.yml
                path: kibana.yml
          - name: elasticsearch-cert
            secret:
              secretName: elasticsearch-tls
              items:
              - key: tls.crt
                path: elasticsearch.crt
    EOF
    deployment.extensions/elastic-kibana created

    Create the kibana ingress.

    $ cat << EOF | kubectl -n elastic apply -f -
    apiVersion: extensions/v1beta1
    kind: Ingress
    metadata:
      name: elastic-kibana
      annotations:
        ingress.bluemix.net/appid-auth: "bindSecret=binding-aaa-dev-appid namespace=elastic requestType=web"
        ingress.bluemix.net/redirect-to-https: "True"
        ingress.bluemix.net/hsts: "enabled=true includeSubdomains=true"
        ingress.bluemix.net/ALB-ID: "$(ibmcloud ks albs --cluster aaa-dev --json | jq -r '. | map(.albID) | join(";")')"
    spec:
      tls:
      - hosts:
        - aaa-dev-logs.innovate.ibm.com
        secretName: aaa-dev.innovate.ibm.com
      - hosts:
        - aaa-stage-logs.innovate.ibm.com
        secretName: aaa-stage.innovate.ibm.com
      rules:
      - host: aaa-dev-logs.innovate.ibm.com
        http:
          paths:
          - path: /kibana
            backend:
              serviceName: elastic-kibana
              servicePort: 5601
      - host: aaa-stage-logs.innovate.ibm.com
        http:
          paths:
          - path: /kibana
            backend:
              serviceName: elastic-kibana
              servicePort: 5601
    EOF
    ingress.extensions/elastic-kibana created

    Create the Curator configmap

    cat << EOF | kubectl -n elastic apply -f -
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: elastic-curator
    data:
      actions: |
        ---
        actions:
          1:
            action: delete_indices
            description: delete APM indices older than 7 days
            options:
              ignore_empty_list: True
            filters:
              - filtertype: pattern
                kind: prefix
                value: apm-
              - filtertype: age
                source: creation_date
                direction: older
                unit: days
                unit_count: 7
          2:
            action: delete_indices
            description: delete AAA indices older than 90 days
            options:
              ignore_empty_list: True
            filters:
              - filtertype: pattern
                kind: prefix
                value: aaa-
              - filtertype: age
                source: creation_date
                direction: older
                unit: days
                unit_count: 90
      config: |
        ---
        client:
          hosts: ${ES_DEPLOYMENT_PRIVATE_HOSTNAME}
          port: ${ES_DEPLOYMENT_PRIVATE_PORT}
          url_prefix: ${ES_DEPLOYMENT_PRIVATE_PATH}
          use_ssl: True
          certificate: /etc/pki/tls/certs/elasticsearch.crt
          ssl_no_validate: False
          http_auth: ${ES_CURATOR_USER_NAME}:${ES_CURATOR_PASSWORD}
    EOF

    Create the Curator cronjob

    cat << EOF | kubectl -n elastic apply -f -
    apiVersion: batch/v1beta1
    kind: CronJob
    metadata:
      name: elastic-curator
    spec:
      concurrencyPolicy: Forbid
      failedJobsHistoryLimit: 1
      schedule: 0 0 * * *
      jobTemplate:
        spec:
          template:
            spec:
              restartPolicy: OnFailure
              containers:
              - args:
                - --config=/etc/curator-config.yaml
                - /etc/curator-actions.yaml
                image: bobrik/curator:5.7.6
                name: elastic-curator
                volumeMounts:
                - mountPath: /etc/curator-config.yaml
                  name: curator-config
                  subPath: curator-config.yaml
                  readOnly: true
                - mountPath: /etc/curator-actions.yaml
                  name: curator-actions
                  subPath: curator-actions.yaml
                  readOnly: true
                - name: elasticsearch-cert
                  mountPath: /etc/pki/tls/certs/elasticsearch.crt
                  readOnly: true
                  subPath: elasticsearch.crt
              volumes:
              - name: curator-config
                configMap:
                  defaultMode: 420
                  items:
                  - key: config
                    path: curator-config.yaml
                  name: elastic-curator
              - name: curator-actions
                configMap:
                  defaultMode: 420
                  items:
                  - key: actions
                    path: curator-actions.yaml
                  name: elastic-curator
              - name: elasticsearch-cert
                secret:
                  secretName: elasticsearch-tls
                  items:
                  - key: "tls.crt"
                    path: elasticsearch.crt
    EOF

Provision the LogDNA Log Analysis and Activity Tracker components

    Provision an instance of LogDNA Log Analysis from the service catalog
    Create a new namespace

    kubectl create ns logdna

    Create the ingestion key secret using the ingestion key from the Log Analysis instance

    kubectl -n logdna create secret generic logdna-agent-key --from-literal=logdna-agent-key=<logDNA_ingestion_key>

    Create the LogDNA agent DaemonSet for the appropriate region and endpoint type. For example, using the us-south region with a private endpoint (see https://cloud.ibm.com/docs/services/Log-Analysis-with-LogDNA?topic=LogDNA-config_agent):

    kubectl -n logdna create -f https://assets.us-south.logging.cloud.ibm.com/clients/logdna-agent-ds-private.yaml

    Edit the DaemonSet to set desired agent tags

    - name: LOGDNA_TAGS
      value: tag1,tag2,tag3

    Provision an instance of LogDNA Activity Tracker from the service catalog
    Copy the IBM Cloud Registry secret from the default namespace

    cat << EOF | kubectl -n logdna apply -f -
    apiVersion: v1
    data:
      .dockerconfigjson: $(kubectl -n default get secret default-icr-io -o jsonpath="{.data['\.dockerconfigjson']}")
    kind: Secret
    metadata:
      name: default-icr-io
    type: kubernetes.io/dockerconfigjson
    EOF

    Configure the image pull secret for the default service account

    kubectl -n logdna patch serviceaccount default -p '{"imagePullSecrets": [{"name": "default-icr-io"}]}'

    Apply the ibmcloud-kube-audit Deployment and Service

    cat << EOF | kubectl apply -f -
    apiVersion: v1
    kind: List
    metadata:
     name: ibmcloud-kube-audit
     namespace: logdna
    items:
     - apiVersion: apps/v1
       kind: Deployment
       metadata:
         name: ibmcloud-kube-audit
         namespace: logdna
         labels:
           app: ibmcloud-kube-audit
       spec:
         replicas: 1
         selector:
           matchLabels:
             app: ibmcloud-kube-audit
         template:
           metadata:
             labels:
               app: ibmcloud-kube-audit
           spec:
             containers:
               - name: ibmcloud-kube-audit
                 image: 'icr.io/ibm/ibmcloud-kube-audit-to-logdna:latest'
                 ports:
                   - containerPort: 3000
     - apiVersion: v1
       kind: Service
       metadata:
         name: ibmcloud-kube-audit-service
         namespace: logdna
         labels:
           app: ibmcloud-kube-audit
       spec:
         selector:
           app: ibmcloud-kube-audit
         ports:
           - protocol: TCP
             port: 80
             targetPort: 3000
         type: ClusterIP
    EOF

    Create the audit webhook to collect Kubernetes API server event logs

    ibmcloud ks cluster master audit-webhook set --cluster <cluster_name_or_ID> --remote-server http://$(kubectl -n logdna get svc ibmcloud-kube-audit-service -o jsonpath='{.spec.clusterIP}')

    Apply the webhook by refreshing the cluster master

    ibmcloud ks apiserver refresh --cluster <cluster_name_or_ID>

Deploy the API components

    Set the server value in the vars file to the cluster public endpoint.

    $ ibmcloud ks cluster-get --cluster $CLUSTER_NAME --json | jq -r '.publicServiceEndpointURL'

    Add the deployer certificate to the vars file for each environment.

    $ for ns in $CLUSTER_NAMESPACES
    do
      echo "$ns:"
      kubectl -n $ns get secret $(kubectl -n $ns get sa aaa-api-deployer -o 'jsonpath={.secrets[0].name}') -o 'jsonpath={.data.ca\.crt}' && echo
    done

    Add the encrypted value of the service account token to the vars file for each environment.

    for ns in $CLUSTER_NAMESPACES
    do
      echo "$ns:"
      kubectl -n $ns get secret $(kubectl -n $ns get sa aaa-api-deployer -o 'jsonpath={.secrets[0].name}') -o 'jsonpath={.data.token}' | base64 --decode | ansible-vault encrypt_string --vault-id $ns@vault/$ns --stdin-name token
    done

    Add the list of private ALBs to the vars file for each environment.

    $ ibmcloud ks albs --cluster $CLUSTER_NAME --json | jq -r '.[] | select(.albType == "private").albID'

    Create an elasticsearch user for the API.

    $ export ES_API_USER_NAME=aaa-api
    $ export ES_API_PASSWORD=$(openssl rand -base64 32 | md5)
    $ ibmcloud cdb user-create $ES_DEPLOYMENT_NAME $ES_API_USER_NAME $ES_API_PASSWORD
    The user is being created with this task:

    Key                   Value
    ID                    crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f:task:1e0bb4e1-7b29-4af9-b0ee-c27c3eecbbc1
    Deployment ID         crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f::
    Description           Creating user.
    Created At            2019-07-12T18:27:16Z
    Status                running
    Progress Percentage   0

    Status                completed
    Progress Percentage   100
    Location              https://api.us-south.databases.cloud.ibm.com/v4/ibm/deployments/crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a%2F2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f::
    OK

    Add the elasticsearch TLS certificate to the vars file for each environment.

    $ for ns in $CLUSTER_NAMESPACES
    do
      echo "$ns:"
      echo $ES_DEPLOYMENT_CERT_BASE64 | base64 --decode | ansible-vault encrypt_string --vault-id $ns@vault/$ns --stdin-name crt
    done

    Add the encrypted value of the elasticsearch URL to the vars file for each environment.

    $ for ns in $CLUSTER_NAMESPACES
    do
      echo "$ns:"
      echo -n "https://$ES_API_USER_NAME:$ES_API_PASSWORD@$ES_DEPLOYMENT_PRIVATE_HOSTNAME:$ES_DEPLOYMENT_PRIVATE_PORT$ES_DEPLOYMENT_PRIVATE_PATH" | ansible-vault encrypt_string --vault-id $ns@vault/$ns --stdin-name elasticsearch-url
    done

Deploy the UI components

    Set the server value in the vars file to the cluster public endpoint.

    $ ibmcloud ks cluster-get --cluster $CLUSTER_NAME --json | jq -r '.publicServiceEndpointURL'

    Add the deployer certificate to the vars file for each environment.

    $ for ns in $CLUSTER_NAMESPACES
    do
      echo "$ns:"
      kubectl -n $ns get secret $(kubectl -n $ns get sa aaa-api-deployer -o 'jsonpath={.secrets[0].name}') -o 'jsonpath={.data.ca\.crt}' && echo
    done

    Add the encrypted value of the service account token to the vars file for each environment.

    $ for ns in $CLUSTER_NAMESPACES
    do
      echo "$ns:"
      kubectl -n $ns get secret $(kubectl -n $ns get sa aaa-ui-deployer -o 'jsonpath={.secrets[0].name}') -o 'jsonpath={.data.token}' | base64 --decode | ansible-vault encrypt_string --vault-id $ns@vault/$ns --stdin-name token
    done

Deploy the controller components

    Set the server value in the vars file to the cluster public endpoint.

    $ ibmcloud ks cluster-get --cluster $CLUSTER_NAME --json | jq -r '.publicServiceEndpointURL'

    Add the deployer certificate to the vars file for each environment.

    $ for ns in $CLUSTER_NAMESPACES
    do
      echo "$ns:"
      kubectl -n $ns get secret $(kubectl -n $ns get sa aaa-controller-deployer -o 'jsonpath={.secrets[0].name}') -o 'jsonpath={.data.ca\.crt}' && echo
    done

    Add the encrypted value of the service account token to the vars file for each environment.

    $ for ns in $CLUSTER_NAMESPACES
    do
      echo "$ns:"
      kubectl -n $ns get secret $(kubectl -n $ns get sa aaa-controller-deployer -o 'jsonpath={.secrets[0].name}') -o 'jsonpath={.data.token}' | base64 --decode | ansible-vault encrypt_string --vault-id $ns@vault/$ns --stdin-name token
    done

    Create an elasticsearch user for Logstash.

    $ export ES_LOGSTASH_USER_NAME=logstash
    $ export ES_LOGSTASH_PASSWORD=$(openssl rand -base64 32 | md5)

    $ ibmcloud cdb user-create $ES_DEPLOYMENT_NAME $ES_LOGSTASH_USER_NAME $ES_LOGSTASH_PASSWORD
    The user is being created with this task:

    Key                   Value
    ID                    crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f:task:66fcca5c-ace0-4222-8650-9eee76e05b12
    Deployment ID         crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a/2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f::
    Description           Creating user.
    Created At            2019-07-17T22:06:28Z
    Status                running
    Progress Percentage   0

    Status                completed
    Progress Percentage   100
    Location              https://api.us-south.databases.cloud.ibm.com/v4/ibm/deployments/crn:v1:bluemix:public:databases-for-elasticsearch:us-south:a%2F2d69a387884748f589e5af22e5991b67:75ff66a9-f89a-4f4b-af00-8ace66fe496f::
    OK

    Add the encrypted password to the vars file for each environment.

    $ for ns in $CLUSTER_NAMESPACES
    do
      echo "$ns:"
      ansible-vault encrypt_string --vault-id $ns@vault/$ns --name password $ES_LOGSTASH_PASSWORD
    done

    Add the other logstash variables (username, host) to the vars file for each environment.
    Once the NLBs have been provisioned add them to the appropriate BlueFringe collection.

    $ export BF_NLB_COLLECTION_NAME=AAA-DEV-NLBS-TACACS

    $ for nlb in $(kubectl -n dev get svc -o json | jq -r '.items[] | select(.spec.type == "LoadBalancer").status.loadBalancer.ingress[0].ip')
    do
      bluefringe collectionsservice addips --ORGID $BF_ORGID --collectionName $BF_NLB_COLLECTION_NAME --data "{\"ips\":[\"$nlb\"]}"
    done
    CollectionsServiceAPI addIPs --collectionName AAA-DEV-NLBS-TACACS --ORGID 40 --environment <unset> --data {"ips":["10.176.13.86"]}
    Operation successful.
    CollectionList:
    ORGID       : 40
    Environment : att
    Name        : AAA-DEV-NLBS-TACACS
    Description : AAAaaS development cluster TACACS NLBs
    Ips         :
    10.176.13.86
    Collections :
    Metadata    : null
    CollectionsServiceAPI addIPs --collectionName AAA-DEV-NLBS-TACACS --ORGID 40 --environment <unset> --data {"ips":["10.184.49.67"]}
    Operation successful.
    CollectionList:
    ORGID       : 40
    Environment : att
    Name        : AAA-DEV-NLBS-TACACS
    Description : AAAaaS development cluster TACACS NLBs
    Ips         :
    10.176.13.86
    10.184.49.67
    Collections :
    Metadata    : null

Naming scheme
Name 	Description
aaa.innovate.ibm.com 	CNAME pointing to aaa-prod-albs.innovate.ibm.com
aaa-stage.innovate.ibm.com 	CNAME pointing to aaa-dev-albs.innovate.ibm.com
aaa-dev.innovate.ibm.com 	CNAME pointing to aaa-dev-albs.innovate.ibm.com
aaa-tacacs.innovate.ibm.com 	CNAME pointing to aaa-prod-nlbs-tacacs.innovate.ibm.com
aaa-stage-tacacs.innovate.ibm.com 	CNAME pointing to aaa-stage-nlbs-tacacs.innovate.ibm.com
aaa-dev-tacacs.innovate.ibm.com 	CNAME pointing to aaa-dev-nlbs-tacacs.innovate.ibm.com
aaa-radius-auth.innovate.ibm.com 	CNAME pointing to aaa-prod-nlbs-radius-auth-udp.innovate.ibm.com
aaa-radius-auth-tcp.innovate.ibm.com 	CNAME pointing to aaa-prod-nlbs-radius-auth-tcp.innovate.ibm.com
aaa-stage-radius-auth.innovate.ibm.com 	CNAME pointing to aaa-stage-nlbs-radius-auth-udp.innovate.ibm.com
aaa-stage-radius-auth-tcp.innovate.ibm.com 	CNAME pointing to aaa-stage-nlbs-radius-auth-tcp.innovate.ibm.com
aaa-dev-radius-auth.innovate.ibm.com 	CNAME pointing to aaa-dev-nlbs-radius-auth-udp.innovate.ibm.com
aaa-dev-radius-auth-tcp.innovate.ibm.com 	CNAME pointing to aaa-dev-nlbs-radius-auth-tcp.innovate.ibm.com
aaa-prod-albs.innovate.ibm.com 	Production UI/API, requires one A record per ALB in production cluster
aaa-dev-albs.innovate.ibm.com 	Development/Staging UI/API, requires one A record per ALB in development cluster
aaa-prod-nlbs-tacacs.innovate.ibm.com 	Production TACACS, requires one A record per NLB in production cluster
aaa-dev-nlbs-tacacs.innovate.ibm.com 	Development TACACS, requires one A record per NLB in development cluster
aaa-stage-nlbs-tacacs.innovate.ibm.com 	Staging TACACS, requires one A record per NLB in development cluster
aaa-prod-alb-<zone>.innovate.ibm.com 	A/PTR record for production ALBs (one per zone)
aaa-dev-alb-<zone>.innovate.ibm.com 	A/PTR record for development ALBs (one per zone)
aaa-prod-nlb-tacacs-<zone>.innovate.ibm.com 	A/PTR record for production NLBs (one per zone)
aaa-stage-nlb-tacacs-<zone>.innovate.ibm.com 	A/PTR record for staging NLBs (one per zone)
aaa-dev-nlb-tacacs-<zone>.innovate.ibm.com 	A/PTR record for development NLBs (one per zone)
aaa-prod-nlbs-radius-auth-udp.innovate.ibm.com 	Production RADIUS auth (udp), requires one A record per NLB
aaa-prod-nlbs-radius-auth-tcp.innovate.ibm.com 	Production RADIUS auth (tcp), requires one A record per NLB
aaa-stage-nlbs-radius-auth-udp.innovate.ibm.com 	Staging RADIUS auth (udp), requires one A record per NLB
aaa-stage-nlbs-radius-auth-tcp.innovate.ibm.com 	Staging RADIUS auth (tcp), requires one A record per NLB
aaa-dev-nlbs-radius-auth-udp.innovate.ibm.com 	Development RADIUS auth (udp), requires one A record per NLB
aaa-dev-nlbs-radius-auth-tcp.innovate.ibm.com 	Development RADIUS auth (tcp), requires one A record per NLB
aaa-prod-nlb-radius-auth-udp-<zone> 	A/PTR record for production NLBs (one per zone)
aaa-prod-nlb-radius-auth-tcp-<zone> 	A/PTR record for production NLBs (one per zone)
aaa-stage-nlb-radius-auth-udp-<zone> 	A/PTR record for staging NLBs (one per zone)
aaa-stage-nlb-radius-auth-tcp-<zone> 	A/PTR record for staging NLBs (one per zone)
aaa-dev-nlb-radius-auth-udp-<zone> 	A/PTR record for development NLBs (one per zone)
aaa-dev-nlb-radius-auth-tcp-<zone> 	A/PTR record for development NLBs (one per zone)
aaa-prod-w<n>-<zone>.innovate.ibm.com 	A/PTR record for production worker nodes
aaa-dev-w<n>-<zone>.innovate.ibm.com 	A/PTR record for development worker nodes
BlueFringe collections
Name 	Elements
AAA-ALL 	AAA-WORKER-NODES, AAA-ALBS, AAA-NLBS-TACACS, AAA-NLBS-RADIUS
AAA-WORKER-NODES 	AAA-PROD-WORKER-NODES, AAA-DEV-WORKER-NODES
AAA-PROD-WORKER-NODES 	10.176.211.117, 10.184.161.197
AAA-DEV-WORKER-NODES 	10.177.181.199, 10.185.148.190
AAA-ALBS 	AAA-PROD-ALBS, AAA-DEV-ALBS
AAA-PROD-ALBS 	10.177.60.75, 10.185.103.58
AAA-DEV-ALBS 	10.176.13.85, 10.184.49.66
AAA-NLBS-TACACS 	AAA-PROD-NLBS-TACACS, AAA-STAGE-NLBS-TACACS, AAA-DEV-NLBS-TACACS
AAA-PROD-NLBS-TACACS 	10.177.60.74, 10.185.103.59
AAA-STAGE-NLBS-TACACS 	10.176.13.82, 10.184.49.70
AAA-DEV-NLBS-TACACS 	10.176.13.86, 10.184.49.67
AAA-NLBS-RADIUS 	AAA-PROD-NLBS-RADIUS-UDP, AAA-PROD-NLBS-RADIUS-TCP, AAA-STAGE-NLB-RADIUS-UDP, AAA-STAGE-NLB-RADIUS-TCP, AAA-DEV-NLBS-RADIUS-UDP, AAA-DEV-NLBS-RADIUS-TCP
AAA-PROD-NLBS-RADIUS-UDP 	10.177.60.77, 10.185.103.61
AAA-PROD-NLBS-RADIUS-TCP 	10.177.60.76, 10.185.103.60
AAA-STAGE-NLB-RADIUS-UDP 	10.176.22.130, 10.185.7.75
AAA-STAGE-NLB-RADIUS-TCP 	10.176.22.133, 10.185.7.74
AAA-DEV-NLBS-RADIUS-UDP 	10.176.13.84, 10.184.49.69
AAA-DEV-NLBS-RADIUS-TCP 	10.176.13.83, 10.184.49.68
INTERNET 	0.0.0.0/5, 8.0.0.0/8, 11.0.0.0/8, 12.0.0.0/6, 16.0.0.0/4, 32.0.0.0/3, 64.0.0.0/2, 128.0.0.0/1
BLUEPAGES 	9.17.186.253, 9.57.182.78
AAA-DATABASES 	AAA-PROD-DATABASES, AAA-DEV-DATABASES
AAA-PROD-DATABASES 	9.45.245.250 (sbydb2p01.fringe.ibm.com)
AAA-DEV-DATABASES 	9.45.245.249 (sbydb2g01.fringe.ibm.com), 9.45.245.248 (sbydb2d01.fringe.ibm.com)
IBM-DNS 	9.0.128.50, 9.0.130.50
VULNERABILITY-SCANNERS 	9.20.225.128/26, 9.20.225.192/26, 9.220.28.92, 9.220.7.145, 9.220.7.148, 9.220.7.166 (source)
BlueFringe policies
Source IP 	Source Port 	Destination IP 	Destination Port 	Protocol 	Description
0.0.0.0/0 	any 	AAA-ALBS 	80,443 	tcp 	Allow access to UI/API (port 80 will be redirected to 443)
0.0.0.0/0 	any 	AAA-NLBS-TACACS 	any 	tcp 	Allow access to TACACS (flows will be restricted to active organization ports)
0.0.0.0/0 	any 	AAA-ALL 	any 	icmp 	Allow ICMP for testing/debug purposes
VULNERABILITY-SCANNERS 	any 	AAA-ALL 	any 	tcp,udp,icmp 	Allow for vulnerability scanning
AAA-WORKER-NODES 	any 	IBM-DNS 	53 	tcp,udp 	Allow access to DNS
AAA-WORKER-NODES 	any 	BLUEPAGES 	636 	tcp 	Allow access to bluepages
AAA-WORKER-NODES 	any 	INTERNET 	443 	tcp 	Allow access to Internet web resources
AAA-PROD-WORKER-NODES 	any 	AAA-PROD-DATABASES 	61000 	tcp 	Allow access to production databases
AAA-DEV-WORKER-NODES 	any 	AAA-DEV-DATABASES 	61000,61003 	tcp 	Allow access to development/staging databases