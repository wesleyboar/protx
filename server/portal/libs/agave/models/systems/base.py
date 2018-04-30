"""
.. module: portal.libs.agave.models.systems.base
   :synopsis: Models representing systems in Agave.
"""
from __future__ import unicode_literals, absolute_import
from collections import namedtuple
import logging
from future.utils import python_2_unicode_compatible
import requests
from requests.exceptions import HTTPError
from cached_property import cached_property
from django.conf import settings
from portal.libs.agave.exceptions import ValidationError
from portal.libs.agave.models.base import BaseAgaveResource

# pylint: disable=invalid-name
logger = logging.getLogger(__name__)
METRICS = logging.getLogger('metrics.{}'.format(__name__))
# pylint: enable=invalid-name


@python_2_unicode_compatible
class BaseSystem(BaseAgaveResource):
    """Agave System representation

    .. note::
        Schema: https://agavepy.readthedocs.io/en/latest/agavepy.systems.html
    .. todo::
        This class should create a better API
    """
    _EXECUTION_TYPES = ['HPC', 'CONDOR', 'CLI']
    EXECUTION_TYPES = namedtuple(
        'ExecutionTypes',
        _EXECUTION_TYPES
    )(
        HPC='HPC',
        CONDOR='CONDOR',
        CLI='CLI'
    )
    _TYPES = ['STORAGE', 'EXECUTION']
    TYPES = namedtuple(
        'SystemTypes',
        _TYPES
    )(
        STORAGE='STORAGE',
        EXECUTION='EXECUTION'
    )
    _AUTH_TYPES = ['SSHKEYS', 'PASSWORD']
    AUTH_TYPES = namedtuple(
        'AuthTypes',
        _AUTH_TYPES
    )(
        SSHKEYS='SSHKEYS',
        PASSWORD='PASSWORD'
    )
    _LOGIN_PROTOCOLS = ['SSH', 'GSISSH', 'LOCAL']
    LOGIN_PROTOCLS = namedtuple(
        'LoginProtocols',
        _LOGIN_PROTOCOLS
    )(
        SSH='SSH',
        GSISSH='GSISSH',
        LOCAL='LOCAL'
    )
    _STORAGE_PROTOCOLS = [
        'FTP',
        'GRIDFTP',
        'IRODS',
        'IRODS4',
        'LOCAL',
        'S3',
        'SFTP'
    ]
    STORAGE_PROTOCLS = namedtuple(
        'StorageProtocols',
        _STORAGE_PROTOCOLS
    )(
        FTP='FTP',
        GRIDFTP='GRIDFTP',
        IRODS='IRODS',
        IRODS4='IRODS4',
        LOCAL='LOCAL',
        S3='S3',
        SFTP='SFTP'
    )
    _SCHEDULERS = [
        'LSF',
        'LOADLEVELER',
        'PBS',
        'SGE',
        'CONDOR',
        'COBALT',
        'TORQUE',
        'MOAB',
        'SLURM',
        'CUSTOM_LSF',
        'CUSTOM_LOADLEVELER',
        'CUSTOM_PBS',
        'CUSTOM_SGE',
        'CUSTOM_CONDOR',
        'FORK',
        'CUSTOM_COBALT',
        'CUSTOM_TORQUE',
        'CUSTOM_MOAB',
        'CUSTOM_SLURM',
        'UNKNOWN'
    ]
    SCHEDULERS = namedtuple(
        'Schedulers',
        _SCHEDULERS
    )(
        LSF='LSF',
        LOADLEVELER='LOADLEVELER',
        PBS='PBS',
        SGE='SGE',
        CONDOR='CONDOR',
        COBALT='COBALT',
        TORQUE='TORQUE',
        MOAB='MOAB',
        SLURM='SLURM',
        CUSTOM_LSF='CUSTOM_LSF',
        CUSTOM_LOADLEVELER='CUSTOM_LOADLEVELER',
        CUSTOM_PBS='CUSTOM_PBS',
        CUSTOM_SGE='CUSTOM_SGE',
        CUSTOM_CONDOR='CUSTOM_CONDOR',
        FORK='FORK',
        CUSTOM_COBALT='CUSTOM_COBALT',
        CUSTOM_TORQUE='CUSTOM_TORQUE',
        CUSTOM_MOAB='CUSTOM_MOAB',
        CUSTOM_SLURM='CUSTOM_SLURM',
        UNKNOWN='UNKNOWN'
    )

    # pylint: disable=redefined-builtin
    def __init__(self, client, **kwargs):
        wrapped = {}
        sys_id = kwargs.get('id')
        if sys_id is not None:
            try:
                wrapped = client.systems.get(
                    systemId=sys_id
                )
            except HTTPError as exc:
                if exc.response.status_code != 404:
                    raise
        wrapped.update(**kwargs)
        storage = wrapped.pop('storage', {})
        login = wrapped.pop('login', {})
        queues = wrapped.pop('queues', {})
        super(BaseSystem, self).__init__(
            client,
            **wrapped
        )
        self.storage = BaseSystemStorage(**storage)
        if wrapped['type'] == self.TYPES.EXECUTION:
            self.login = BaseSystemLogin(**login)
            self.queues = BaseSystemQueues(client, queues)
    # pylint: enable=redefined-builtin

    @classmethod
    def create(cls, client, body):
        """Create a system

        :param dict body: System definition
        """
        resp = client.add(body=body)
        return cls(client, **resp)

    @classmethod
    def list(
            cls,
            client,
            type=None,  # pylint: disable=redefined-builtin
            default=False,
            limit=100,
            offset=0,
            public=False
    ):  # pylint: disable=too-many-arguments
        """List systems belonging to a specific user

        :param str type: Type of systems. One of :attr:`BaseSystem.TYPES`
        :param client: Agave client to use
        :param bool default: Only list default systems
        :param bool public: Only list public systems
        :param int limit: Page limit
        :param int offset: Page offset

        :return: Generator with systems
        :rtype: generator
        """
        systems = client.systems.list(
            type=type,
            default=default,
            limit=limit,
            offset=offset,
            public=public
        )
        for system in systems:
            yield cls(client, id=system.id)

    @classmethod
    def search(cls, client, query):
        """Search systems

        This is using the Agave `systems.search` directly.
        The query is a dictionary where each key is a Mongo-like search query
        using the value of the key.

        :Example:

            >>> systems = BaseSystem.search(
            ...     client,
            ...     {
            ...         'type.eq': BaseSystem.TYPES.STORAGE,
            ...         'id.like': 'cep.project.*'
            ...     }
            ... )
            >>> print systems
            ... [{'type': 'STORAGE', 'id': 'cep.project.123123-123-012'}, ...]

        :param client: Agave client to use
        :param dict queyr: Query to use

        :return list: A list of system objects

        .. seealso:: `systems-search --help`
        """
        if client.token:
            token = client.token.token_info['access_token']
        else:
            token = client._token  # pylint: disable=protected-access

        headers = {'Authorization': 'Bearer {token}'.format(token=token)}
        resp = requests.get(
            '{baseurl}/systems/v2'.format(
                baseurl=settings.AGAVE_TENANT_BASEURL),
            headers=headers,
            params=query
        )
        resp.raise_for_status()
        systems = resp.json()['response']
        return systems

    def _populate_obj(self):
        """Overriding

        Everything gets easier if we always populate system objects.
        """
        pass

    def update(self):
        """Updates a system"""
        self.validate()
        self._ac.systems.update(
            systemId=self.id,
            body=self.to_dict()
        )

    def set_login_keys(self, username, priv_key, pub_key):
        """Set SSH keys for login in a system"""
        self.login.auth.username = username
        self.login.auth.private_key = priv_key
        self.login.auth.public_key = pub_key
        self.update()
        return self

    def set_storage_keys(self, username, priv_key, pub_key):
        """Set SSH keys for storage login in a system"""
        self.storage.auth.username = username
        self.storage.auth.private_key = priv_key
        self.stroage.auth.public_key = pub_key
        self.update()
        self.storage.auth.private_key = ''
        return self

    def save(self):
        """Saves a new storage instance

        .. warning::
            If the system already exists a `ValueError` will be raised.
        """
        self.validate()
        try:
            res = self._ac.systems.get(
                systemId=self.id
            )
            if (res.status_code >= 200 and
                    res.status_code <= 299):
                raise ValueError(
                    'Agave System Id already exists'
                )
        except HTTPError as exc:
            if exc.response.status_code != 404:
                raise
        self._ac.systems.add(
            body=self.to_dict()
        )
        return self

    def update_role(self, username, role):
        """Update role for a system

        shortcut method for agavepy.systems.updateRole

        .. todo::
            There should be a better API to update permissions
        """
        self._ac.systems.updateRole(
            systemId=self.id,
            body={
                'role': role,
                'username': username
            }
        )


@python_2_unicode_compatible  # pylint: disable=too-few-public-methods
class BaseSystemProxy(BaseAgaveResource):
    """`proxy` nested object representation

        Class to represent the `proxy` nested object
        in a storage definition. This class is here
        to explicitly show how a system defines a storage.

    .. warning::
        This should only be used internally.
    """

    _body_fields = [
        'name',
        'host',
        'port'
    ]

    def __init__(self, **kwargs):
        super(BaseSystemProxy, self).__init__(
            None,
            **kwargs
        )
        self.name = kwargs.get('name')
        self.host = kwargs.get('host')
        self.port = kwargs.get('port')

    def _populate_obj(self):
        """No need to populate this obj"""
        pass

    def to_dict(self):
        """To dict conversion"""
        if (not self.name and
                not self.host and
                not self.port):
            return None

        dict_obj = super(BaseSystemProxy, self).to_dict()
        return dict_obj


@python_2_unicode_compatible  # pylint: disable=too-few-public-methods
class BaseSystemAuth(BaseAgaveResource):
    """`auth` nested object representation

        Class to represent the `auth` nested object
        in a storage definition. This class is here
        to explicitly show how a system defines a storage.

    .. warning::
        This should only be used internally.
    """

    _body_fields = [
        'type',
        'username',
        'public_key',
        'private_key',
        'password'
    ]

    def __init__(self, **kwargs):
        super(BaseSystemAuth, self).__init__(
            None,
            **kwargs
        )
        self.type = kwargs.get('type')
        self.username = kwargs.get('username')
        self.public_key = kwargs.get('publicKey')
        self.private_key = kwargs.get('privateKey')
        self.password = kwargs.get('password')

    def _populate_obj(self):
        """No need to populate this obj"""
        pass

    def to_dict(self):
        """To dict conversion"""
        dict_obj = super(BaseSystemAuth, self).to_dict()
        if self.type == BaseSystem.AUTH_TYPES.SSHKEYS:
            dict_obj.pop('password', None)
        elif self.type == BaseSystem.AUTH_TYPES.PASSWORD:
            dict_obj.pop('publicKey', None)
            dict_obj.pop('privateKey', None)
        return dict_obj


# pylint: disable=too-few-public-methods
# pylint: disable=too-many-instance-attributes
@python_2_unicode_compatible
class BaseSystemStorage(BaseAgaveResource):
    """`storage` nested object represntation

        Class to represent the `storage` nested object
        in a storage definition. This class is here
        to explicitly show how a system defines a storage.

    .. warning::
        This should only be used internally.
    """

    _body_fields = [
        'proxy',
        'protocol',
        'mirror',
        'port',
        'public_apps_dir',
        'host',
        'root_dir',
        'home_dir',
        'auth'
    ]

    def __init__(self, **kwargs):
        auth = kwargs.pop('auth', {}) or {}
        proxy = kwargs.pop('proxy', {}) or {}
        super(BaseSystemStorage, self).__init__(
            None,
            **kwargs
        )
        self.auth = BaseSystemAuth(**auth)
        self.proxy = BaseSystemProxy(**proxy)
        self.protocol = kwargs.get('protocol')
        self.mirror = kwargs.get('mirror', False)
        self.port = kwargs.get('port')
        self.public_apps_dir = kwargs.get('publicAppsDir')
        self.host = kwargs.get('host')
        self.root_dir = kwargs.get('rootDir')
        self.home_dir = kwargs.get('homeDir')

    def _populate_obj(self):
        """No need to populate this obj"""
        pass

    def validate_protocol(self):
        """Validate self.protocol"""
        # pylint: disable=protected-access
        protocols = BaseSystem._STORAGE_PROTOCOLS
        if self.protocol not in protocols:
            raise ValidationError(
                "'protocol' should be one of {protocols}".format(
                    protocols=protocols
                )
            )

    def validate_mirror(self):
        """Validate self.mirror"""
        if not isinstance(self.mirror, bool):
            raise ValidationError(
                "'mirror' should be 'bool'"
            )

    def validate_port(self):
        """Validate self.port"""
        if not self.port:
            raise ValidationError(
                "'port' should not be empty"
            )

    def validate_host(self):
        """Validate self.host"""
        if not self.host:
            raise ValidationError(
                "'host' should not be empty"
            )

    def validate_root_dir(self):
        """Validate self.root_dir"""
        if not self.root_dir:
            raise ValidationError(
                "'root_dir' should not be empty"
            )

    def validate_home_dir(self):
        """Validate self.home_dir"""
        if not self.home_dir:
            raise ValidationError(
                "'home_dir' should not be empty"
            )


@python_2_unicode_compatible  # pylint: disable=too-few-public-methods
class BaseSystemLogin(BaseAgaveResource):
    """`login` nested object representation

        Class to represent the `login` nested object
        in a storage definition. This class is here
        to explicitly show how a system defines a storage.

    .. warning::
        This should only be used internally.
    """

    _body_fields = [
        'proxy',
        'protocol',
        'port',
        'auth',
        'host'
    ]

    def __init__(self, **kwargs):
        auth = kwargs.pop('auth', {}) or {}
        proxy = kwargs.pop('proxy', {}) or {}
        super(BaseSystemLogin, self).__init__(
            None,
            **kwargs
        )
        self.auth = BaseSystemAuth(**auth)
        self.proxy = BaseSystemProxy(**proxy)
        self.protocol = kwargs.get('protocol')
        self.port = kwargs.get('port')
        self.host = kwargs.get('host')

    def _populate_obj(self):
        """No need to populate this obj"""
        pass

    def validate_protocol(self):
        """Validate self.protocol"""
        # pylint: disable=protected-access
        protocols = BaseSystem._LOGIN_PROTOCOLS
        if self.protocol not in protocols:
            raise ValidationError(
                "'protocol' should be one of: {protocols}".format(
                    protocols=protocols
                )
            )

    def validate_port(self):
        """Validate self.port"""
        if not self.port:
            raise ValidationError(
                "'port' should not be empty"
            )

    def validate_host(self):
        """Validate self.host"""
        if not self.host:
            raise ValidationError(
                "'host' should not be empty"
            )


@python_2_unicode_compatible  # pylint: disable=too-few-public-methods
class BaseSystemQueue(BaseAgaveResource):
    """Base System Queue"""

    _body_fields = [
        'name',
        'max_jobs',
        'max_user_jobs',
        'max_nodes',
        'max_processors_per_node',
        'max_memory_per_node',
        'custom_directives',
        'default'
    ]

    def __init__(self, client, **kwargs):
        super(BaseSystemQueue, self).__init__(client, **kwargs)
        self.name = kwargs.get('name', '')
        self.max_jobs = kwargs.get('max_jobs', 10)
        self.max_user_jobs = kwargs.get('max_user_jobs', 10)
        self.max_nodes = kwargs.get('max_nodes', None)
        self.max_processors_per_node = kwargs.get(
            'max_processors_per_node',
            None
        )
        self.max_memory_per_node = kwargs.get(
            'max_memory_per_node',
            None
        )
        self.max_requested_time = kwargs.get(
            'max_requested_time',
            None
        )
        self.custom_directives = kwargs.get(
            'custom_directives',
            None
        )
        self.default = kwargs.get('default', False)

    def populate_obj(self):
        """Overriding """
        pass

    def validate_name(self):
        """Validate self.name"""
        if not self.name:
            raise ValidationError(
                "'name' should not be empty"
            )

    def validate_max_jobs(self):
        """Validate self.max_jobs"""
        if not isinstance(self.max_jobs, int) or self.max_jobs < -1:
            raise ValidationError(
                "'max_jobs' should be an integer greater or equal to '-1'"
            )

    def validate_max_user_jobs(self):
        """Validate self.max_user_jobs"""
        if (not isinstance(self.mx_user_jobs, int) or
                self.max_user_jobs < -1):
            raise ValidationError(
                "'max_user_jobs' should be an integer greater or equal to '-1'"
            )

    def validate_max_nodes(self):
        """Validate self.max_nodes"""
        if (not isinstance(self.max_nodes, int) or
                self.max_nodes < -1):
            raise ValidationError(
                "'max_nodes' should be an integer greater or equal to '-1'"
            )

    def validate_max_processors_per_node(self):  # pylint: disable=invalid-name
        """Validate self.max_processors_per_node"""
        if (not isinstance(self.validate_max_processors_per_node, int) or
                self.max_processors_per_node < -1):
            raise ValidationError(
                "'max_processors_per_node' should be an integer "
                "greater or equal to '-1'"
            )

    def validate_max_memory_per_node(self):
        """Validate self.max_memory_per_node"""
        if not self.max_memory_per_node:
            raise ValidationError(
                "'max_memory_per_node' should not be empty"
            )

    def validate_max_requested_time(self):
        """Validate self.max_requested_time"""
        if not self.max_requested_time:
            raise ValidationError(
                "'max_requested_time' should not be empty"
            )

    def validate_custom_directives(self):
        """Validate self.custom_directives"""
        if not self.custom_directives:
            raise ValidationError(
                "'custom_directives' should not be empty"
            )

    def validate_default(self):
        """Validate self.default"""
        if not isinstance(self.default, bool):
            raise ValidationError(
                "'default' should be of type 'bool'"
            )


@python_2_unicode_compatible  # pylint: disable=too-few-public-methods
class BaseSystemQueues(object):
    """Base System Queues

    Class to hold queues for an exec system
    """

    def __init__(self, client, queues):
        self._ac = client
        self.queues = [
            BaseSystemQueue(client, **queue) for queue in queues
        ]

    def all(self):
        """Return all queues"""
        return self.queues

    @cached_property
    def names(self):
        """Return all queues' names"""
        return [
            queue.name for queue in self.queues
        ]

    def add(
            self,
            name,
            max_jobs,
            max_user_jobs,
            max_nodes,
            max_processors_per_node,
            max_memory_per_node,
            custom_directives,
            default
    ):  # pylint: disable=too-many-arguments
        """Add a queue to an exec system"""
        queue = BaseSystemQueue(
            self._ac,
            name=name,
            max_jobs=max_jobs,
            max_user_jobs=max_user_jobs,
            max_nodes=max_nodes,
            max_processors_per_node=max_processors_per_node,
            max_memory_per_node=max_memory_per_node,
            custom_directives=custom_directives,
            default=default
        )
        self.queues.append(queue)

    def to_dict(self):
        """To dict conversion"""
        return [
            queue.to_dict() for queue in self.queues
        ]
