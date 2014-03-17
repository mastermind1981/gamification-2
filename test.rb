ENV['RACK_ENV'] = 'test'

require 'test/unit'
require 'rack/test'

require File.expand_path '../web.rb', __FILE__

class GamificationTest < Test::Unit::TestCase

  include Rack::Test::Methods

  def app
    Gamification
  end

  def test_login
    get '/loginsso.html' do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'text/html;charset=utf-8'
    end
  end

  def test_group_student
    @studentId = nil
    @groupId = nil
    @classId = nil

    post '/student/0000' do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json
      assert json['_id']
      assert_equal '0000', json.fetch('facebookId')
      p "POST student: "+json.fetch('_id')
      @studentId = json.fetch('_id')
    end

    put '/student/'+@studentId, {:expertLevel => 2}.to_json do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json
      assert_equal 2, json.fetch('expertLevel')
      p "PUT student: "+json.fetch('_id')+" ("+json.fetch('expertLevel').to_s+")"
    end

    post '/group' do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json
      assert json['_id']
      @groupId = json.fetch('_id')
      p "POST group: "+@groupId
    end

    put '/group/'+@groupId, {:label => 'test', :avatarUrl => 'http://test.com', :blogUrl => 'http://test.blog.com', :score  => 123}.to_json do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json
      assert_equal 'test', json.fetch('label')
      assert_equal 'http://test.com', json.fetch('avatarUrl')
      assert_equal 'http://test.blog.com', json.fetch('blogUrl')
      assert_equal 123, json.fetch('score')
      p "PUT group: "+json.fetch('_id')+" ("+json.fetch('label').to_s+", "+json.fetch('avatarUrl').to_s+", "+json.fetch('blogUrl').to_s+", "+json.fetch('score').to_s+")"
    end

    put '/group/'+@groupId+'/addstudent/'+@studentId do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json

      p "PUT add student to group: "+json.fetch('_id')+" ("+json.fetch('students').to_s+")"
    end

    get '/student/'+@studentId do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json
      assert json['_id']
      assert_equal '0000', json.fetch('facebookId')
      assert_equal @groupId, json.fetch('group_id')
      p "GET student: "+json.fetch('_id')
    end

    put '/group/'+@groupId+'/removestudent/'+@studentId do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json

      p "PUT remove student from group: "+json.fetch('_id')+" ("+json.fetch('students').to_s+")"
    end

    post '/classroom' do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json
      assert json['_id']
      @classId = json.fetch('_id')
      p "POST classroom: "+@classId
    end

    put '/classroom/'+@classId, {:label => 'test'}.to_json do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json
      assert_equal 'test', json.fetch('label')
      p "PUT classroom: "+json.fetch('_id')+" ("+json.fetch('label').to_s+")"
    end

    put '/classroom/'+@classId+'/addgroup/'+@groupId do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json

      p "PUT add group to classroom: "+json.fetch('_id')+" ("+json.fetch('groups').to_s+")"
    end

    get '/group/'+@groupId do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json
      assert json['_id']
      assert_equal @classId, json.fetch('classroom_id')
      p "GET group: "+json['_id']
    end

    put '/classroom/'+@classId+'/removegroup/'+@groupId do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json

      p "PUT remove group from classroom: "+json.fetch('_id')+" ("+json.fetch('groups').to_s+")"
    end

    delete '/student/'+@studentId do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json
      assert json.fetch('message')
      p "DELETE student: "+json.fetch('message')
    end

    delete '/group/'+@groupId do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json
      assert json.fetch('message')
      p "DELETE group: "+json.fetch('message')
    end

    delete '/classroom/'+@classId do
      assert_equal 200, last_response.status
      assert_includes last_response.content_type, 'application/json'

      json = JSON.parse(last_response.body)
      assert_kind_of Hash, json
      assert json.fetch('message')
      p "DELETE classroom: "+json['message']
    end
  end
end